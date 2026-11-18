/**
 * @fileoverview Subnet and CIDR calculation utility for NetPulse.
 * Provides both terminal CLI output and interactive calculation data.
 */

/**
 * Calculates complete subnet and IP details for a given CIDR notation string (e.g. "192.168.1.0/24").
 * @param {string} cidrInput - Dotted decimal IP address with CIDR prefix (e.g. "192.168.1.10/24" or "10.0.0.1/16").
 * @returns {Object} Comprehensive subnet calculation results.
 */
function calculateSubnetDetails(cidrInput) {
    if (!cidrInput || typeof cidrInput !== "string") {
        throw new Error("Invalid input: Please provide an IP/CIDR string (e.g. 192.168.1.0/24).");
    }

    const trimmed = cidrInput.trim();
    let ip = "";
    let prefix = 24;

    if (trimmed.includes("/")) {
        const parts = trimmed.split("/");
        ip = parts[0].trim();
        prefix = parseInt(parts[1].trim(), 10);
    } else {
        ip = trimmed;
        prefix = 24;
    }

    if (!isValidIp(ip)) {
        throw new Error(`Invalid IPv4 address: "${ip}".`);
    }

    if (isNaN(prefix) || prefix < 0 || prefix > 32) {
        throw new Error(`Invalid CIDR prefix: "/${prefix}". Prefix must be between 0 and 32.`);
    }

    // Generate dotted decimal netmask from prefix
    const netmaskBinaryStr = "".padStart(prefix, "1").padEnd(32, "0");
    const netmaskOctets = netmaskBinaryStr.match(/.{8}/g).map(b => parseInt(b, 2));
    const netmask = netmaskOctets.join(".");

    // Calculate Wildcard Mask
    const wildcardOctets = netmaskOctets.map(o => 255 - o);
    const wildcard = wildcardOctets.join(".");

    // Network Address & Broadcast Address
    const ipOctets = ip.split(".").map(o => parseInt(o, 10));
    const networkOctets = ipOctets.map((o, i) => o & netmaskOctets[i]);
    const network = networkOctets.join(".");

    const broadcastOctets = networkOctets.map((o, i) => o | wildcardOctets[i]);
    const broadcast = broadcastOctets.join(".");

    // Host calculation
    let totalAddresses = Math.pow(2, 32 - prefix);
    let usableHosts = 0;
    let firstUsable = "";
    let lastUsable = "";

    if (prefix === 31) {
        // RFC 3021 Point-to-Point link
        usableHosts = 2;
        firstUsable = network;
        lastUsable = broadcast;
    } else if (prefix === 32) {
        // Single host route
        usableHosts = 1;
        firstUsable = network;
        lastUsable = network;
    } else if (prefix <= 30) {
        usableHosts = totalAddresses - 2;
        const firstOctets = [...networkOctets];
        firstOctets[3] += 1;
        firstUsable = firstOctets.join(".");

        const lastOctets = [...broadcastOctets];
        lastOctets[3] -= 1;
        lastUsable = lastOctets.join(".");
    }

    // IP Class and Scope
    const firstOctet = ipOctets[0];
    let ipClass = "Class A";
    if (firstOctet >= 128 && firstOctet <= 191) ipClass = "Class B";
    else if (firstOctet >= 192 && firstOctet <= 223) ipClass = "Class C";
    else if (firstOctet >= 224 && firstOctet <= 239) ipClass = "Class D (Multicast)";
    else if (firstOctet >= 240) ipClass = "Class E (Experimental)";

    let scope = "Public Internet";
    if (firstOctet === 10) scope = "Private (RFC 1918 Class A)";
    else if (firstOctet === 172 && ipOctets[1] >= 16 && ipOctets[1] <= 31) scope = "Private (RFC 1918 Class B)";
    else if (firstOctet === 192 && ipOctets[1] === 168) scope = "Private (RFC 1918 Class C)";
    else if (firstOctet === 127) scope = "Loopback (RFC 1122)";
    else if (firstOctet === 169 && ipOctets[1] === 254) scope = "Link-Local / APIPA (RFC 3927)";

    // Binary formatting
    const ipBinary = ipOctets.map(o => o.toString(2).padStart(8, "0")).join(".");
    const netmaskBinary = netmaskOctets.map(o => o.toString(2).padStart(8, "0")).join(".");

    return {
        cidr: `${ip}/${prefix}`,
        ip,
        prefix,
        netmask,
        wildcard,
        network,
        broadcast,
        firstUsable,
        lastUsable,
        totalAddresses,
        usableHosts,
        ipClass,
        scope,
        ipBinary,
        netmaskBinary
    };
}

/**
 * Handles the `subnet` and `calc` terminal command.
 * Syntax:
 *   subnet <ip/prefix>        - Calculates and prints subnet breakdown.
 *   subnet gui                - Opens the visual Subnet Calculator modal.
 * @param {string} networkObjectId - The device executing the command.
 * @param {Array<string>} args - Command arguments.
 * @returns {void}
 */
function command_subnet(networkObjectId, args) {
    if (!args[1] || args[1] === "-h" || args[1] === "--help") {
        let help = "NAME\n";
        help += "    subnet / calc - NetPulse Subnet & CIDR Calculator\n\n";
        help += "SYNOPSIS\n";
        help += "    subnet <ip/cidr>\n";
        help += "    subnet gui\n\n";
        help += "EXAMPLES\n";
        help += "    subnet 192.168.1.0/24\n";
        help += "    subnet 10.0.0.1/16\n";
        help += "    subnet 172.16.50.25/28\n";
        help += "    subnet gui\n";
        terminalMessage(help, networkObjectId);
        return;
    }

    if (args[1] === "gui") {
        openSubnetCalculator();
        terminalMessage("Opened graphical Subnet Calculator.", networkObjectId);
        return;
    }

    try {
        const details = calculateSubnetDetails(args[1]);
        let msg = "=========================================================\n";
        msg += "           NETPULSE SUB-NETWORK & CIDR CALCULATOR        \n";
        msg += "=========================================================\n";
        msg += `Input CIDR:          ${details.cidr}\n`;
        msg += `IP Address:          ${details.ip}\n`;
        msg += `Subnet Mask:         ${details.netmask} (/${details.prefix})\n`;
        msg += `Wildcard Mask:       ${details.wildcard}\n`;
        msg += `Network Address:     ${details.network}\n`;
        msg += `Broadcast Address:   ${details.broadcast}\n`;
        msg += `First Usable Host:   ${details.firstUsable}\n`;
        msg += `Last Usable Host:    ${details.lastUsable}\n`;
        msg += `Total Usable Hosts:  ${details.usableHosts.toLocaleString()} host(s)\n`;
        msg += `Total IP Range:      ${details.totalAddresses.toLocaleString()} address(es)\n`;
        msg += `Class & Scope:       ${details.ipClass} | ${details.scope}\n`;
        msg += "---------------------------------------------------------\n";
        msg += `IP Binary:           ${details.ipBinary}\n`;
        msg += `Mask Binary:         ${details.netmaskBinary}\n`;
        msg += "=========================================================\n";
        terminalMessage(msg, networkObjectId);
    } catch (err) {
        terminalMessage(`Error: ${err.message}`, networkObjectId);
    }
}

/**
 * Creates and returns the interactive Subnet Calculator Modal component.
 * @returns {HTMLElement} The Subnet Calculator modal DOM element.
 */
function SubnetCalculatorModal() {
    const $modal = document.createElement("article");
    $modal.classList.add("subnet-calculator-modal", "draggable-modal", "modal");
    $modal.style.display = "none";
    $modal.style.width = "480px";
    $modal.style.maxHeight = "90vh";
    $modal.style.overflowY = "auto";
    $modal.style.zIndex = "1000";

    $modal.innerHTML = `
        <div class="window-frame">
            <p>NetPulse Subnet & CIDR Calculator</p>
        </div>

        <div style="padding: 18px 22px; display: flex; flex-direction: column; gap: 14px;">
            <div style="display: flex; gap: 10px; align-items: center;">
                <div style="flex: 2;">
                    <label style="font-size: 12px; font-weight: 600; color: #475569; display: block; margin-bottom: 4px;">IP Address:</label>
                    <input type="text" id="subnet-ip-input" value="192.168.1.10" 
                           style="width: 100%; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-family: monospace; font-size: 14px;" />
                </div>
                <div style="flex: 1;">
                    <label style="font-size: 12px; font-weight: 600; color: #475569; display: block; margin-bottom: 4px;">CIDR Prefix:</label>
                    <select id="subnet-cidr-select" 
                            style="width: 100%; padding: 8px 8px; border: 1px solid #cbd5e1; border-radius: 6px; font-family: monospace; font-size: 14px; background: white;">
                    </select>
                </div>
                <div style="align-self: flex-end;">
                    <button id="subnet-calc-btn" class="btn-modern-blue" style="padding: 8px 16px; font-weight: 600;">Calculate</button>
                </div>
            </div>

            <div id="subnet-results" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; font-size: 13px; display: flex; flex-direction: column; gap: 8px;">
                <!-- Populated dynamically -->
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 8px;">
                <button id="subnet-close-btn" class="btn-modern-red" style="padding: 6px 14px;">Close</button>
            </div>
        </div>
    `;

    // Populate CIDR options /0 through /32
    const $select = $modal.querySelector("#subnet-cidr-select");
    for (let i = 32; i >= 1; i--) {
        const opt = document.createElement("option");
        opt.value = i;
        opt.textContent = `/${i}`;
        if (i === 24) opt.selected = true;
        $select.appendChild(opt);
    }

    const runCalculation = () => {
        const ip = $modal.querySelector("#subnet-ip-input").value.trim();
        const cidr = $modal.querySelector("#subnet-cidr-select").value;
        const $results = $modal.querySelector("#subnet-results");

        try {
            const data = calculateSubnetDetails(`${ip}/${cidr}`);
            $results.innerHTML = `
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                    <div><span style="color:#64748b; font-size: 11px;">NETWORK ADDRESS</span><br><b style="color:#0f172a; font-family: monospace;">${data.network}</b></div>
                    <div><span style="color:#64748b; font-size: 11px;">BROADCAST ADDRESS</span><br><b style="color:#0f172a; font-family: monospace;">${data.broadcast}</b></div>
                    <div><span style="color:#64748b; font-size: 11px;">SUBNET MASK</span><br><b style="color:#0f172a; font-family: monospace;">${data.netmask}</b></div>
                    <div><span style="color:#64748b; font-size: 11px;">WILDCARD MASK</span><br><b style="color:#0f172a; font-family: monospace;">${data.wildcard}</b></div>
                    <div><span style="color:#64748b; font-size: 11px;">FIRST USABLE HOST</span><br><b style="color:#2563eb; font-family: monospace;">${data.firstUsable}</b></div>
                    <div><span style="color:#64748b; font-size: 11px;">LAST USABLE HOST</span><br><b style="color:#2563eb; font-family: monospace;">${data.lastUsable}</b></div>
                    <div><span style="color:#64748b; font-size: 11px;">USABLE HOSTS</span><br><b style="color:#16a34a;">${data.usableHosts.toLocaleString()}</b></div>
                    <div><span style="color:#64748b; font-size: 11px;">CLASS & SCOPE</span><br><b style="color:#7c3aed; font-size:12px;">${data.ipClass} (${data.scope})</b></div>
                </div>
                <hr style="border:0; border-top: 1px solid #e2e8f0; margin: 6px 0;" />
                <div style="font-family: monospace; font-size: 11px; word-break: break-all;">
                    <span style="color:#64748b;">Binary IP:</span> ${data.ipBinary}<br>
                    <span style="color:#64748b;">Binary Mask:</span> ${data.netmaskBinary}
                </div>
            `;
        } catch (err) {
            $results.innerHTML = `<p style="color:#dc2626; margin:0;"><b>Error:</b> ${err.message}</p>`;
        }
    };

    $modal.querySelector("#subnet-calc-btn").addEventListener("click", runCalculation);
    $modal.querySelector("#subnet-ip-input").addEventListener("keydown", (e) => { if (e.key === "Enter") runCalculation(); });
    $modal.querySelector("#subnet-cidr-select").addEventListener("change", runCalculation);
    $modal.querySelector("#subnet-close-btn").addEventListener("click", () => { $modal.style.display = "none"; });
    $modal.querySelector(".window-frame").addEventListener("mousedown", dragModal);

    // Initial calculation
    runCalculation();

    return $modal;
}

/**
 * Displays the Subnet Calculator modal.
 */
function openSubnetCalculator() {
    let $modal = document.querySelector(".subnet-calculator-modal");
    if (!$modal) {
        $modal = SubnetCalculatorModal();
        document.body.appendChild($modal);
    }
    $modal.style.display = "block";
    $modal.style.top = "15%";
    $modal.style.left = "calc(50% - 240px)";
}
