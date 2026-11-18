/**
 * @fileoverview 1-Click Presentation Scenario Presets for NetPulse.
 * Provides pre-configured, instantly loadable network topologies for
 * live demonstration of all major Computer Network syllabus concepts.
 */

/**
 * Resets the entire workspace board cleanly, removing all devices,
 * cables, timers, and pending protocol buffers.
 */
function resetNetPulseWorkspace() {
    cleanUpWorkspace();

    const $board = document.querySelector(".board");
    if (!$board) return;

    // Remove all dropped devices and annotations
    $board.querySelectorAll(".item-dropped, .text-annotation").forEach(el => el.remove());

    // Clear SVG cables
    const $svg = document.getElementById("svg-board");
    if ($svg) $svg.innerHTML = "";

    // Reset counters and buffers
    itemIndex = 0;
    arpFlag = {};
    icmpFlag = {};
    dhcpDiscoverFlag = {};
    dhcpRequestFlag = {};
    dnsRequestFlag = {};
    tcpSyncFlag = {};
    traceFlag = {};
    trace = {};
    traceReturn = {};
    buffer = {};
    httpBuffer = {};
    dhcpOfferBuffer = {};
    tcpBuffer = {};
    traceBuffer = {};

    visualToggle = true;
    visualSpeed = 350;
    paused = false;
}

/**
 * Connects a network device interface to a target switch with an SVG cable.
 * @param {HTMLElement} $dev - Source device DOM element.
 * @param {HTMLElement} $sw - Destination switch DOM element.
 * @param {string} iface - Interface name on source device (e.g. "enp0s3" or "enp0s8").
 */
function wireDeviceToSwitch($dev, $sw, iface = "enp0s3") {
    const devX = $dev.style.left;
    const devY = $dev.style.top;
    const swX = $sw.style.left;
    const swY = $sw.style.top;

    CableObject(devX, devY, swX, swY, $dev.id, $sw.id, iface);
    addSwitchPort($sw.id, $dev.id);
    $dev.setAttribute(`data-switch-${iface}`, $sw.id);
}

/**
 * Adds an informational text annotation to the board.
 * @param {number} x - X coordinate.
 * @param {number} y - Y coordinate.
 * @param {string} text - Message text.
 */
function createScenarioAnnotation(x, y, text) {
    const $board = document.querySelector(".board");
    const $txt = TextObject(x, y);
    const $input = $txt.querySelector("input");
    if ($input) {
        $input.value = text;
        $input.style.width = `${Math.max(text.length * 8.5, 120)}px`;
    }
    $txt.setAttribute("data-text", text);
    $board.appendChild($txt);
    itemIndex++;
}

/**
 * Scenario 1: Local Area Network, ARP Discovery & MAC Learning.
 * 2 PCs connected to 1 Switch on 192.168.1.0/24.
 */
function loadScenario1_LAN() {
    resetNetPulseWorkspace();
    const $board = document.querySelector(".board");

    // 1. Create Switch
    const $sw = SwitchObject(480, 220);
    $sw.setAttribute("ondrop", "dropPackageOverItem(event); dropSwitchOverItem(event);");
    $board.appendChild($sw);
    itemIndex++;

    // 2. Create PC-1 (192.168.1.10/24)
    const $pc1 = PcObject(240, 220);
    $pc1.setAttribute("ondrop", "dropPackageOverItem(event); dropSwitchOverItem(event);");
    $board.appendChild($pc1);
    itemIndex++;
    configureInterface($pc1.id, "192.168.1.10", "255.255.255.0", "enp0s3");

    // 3. Create PC-2 (192.168.1.20/24)
    const $pc2 = PcObject(720, 220);
    $pc2.setAttribute("ondrop", "dropPackageOverItem(event); dropSwitchOverItem(event);");
    $board.appendChild($pc2);
    itemIndex++;
    configureInterface($pc2.id, "192.168.1.20", "255.255.255.0", "enp0s3");

    // 4. Wire cables
    wireDeviceToSwitch($pc1, $sw, "enp0s3");
    wireDeviceToSwitch($pc2, $sw, "enp0s3");

    // 5. Annotations
    createScenarioAnnotation(480, 140, "LAN & ARP Discovery Lab (Subnet: 192.168.1.0/24)");
    createScenarioAnnotation(240, 310, "PC-1: 192.168.1.10/24");
    createScenarioAnnotation(720, 310, "PC-2: 192.168.1.20/24");
    createScenarioAnnotation(480, 370, "Demo Step: Open PC-1 Terminal -> Run: ping 192.168.1.20 to watch ARP broadcast & Switch MAC learning!");

    closeScenariosMenu();
    bodyComponent.render(popupMessage("Scenario 1 Loaded: LAN & ARP Discovery Lab"));
}

/**
 * Scenario 2: Enterprise Multi-LAN Routing, Default Gateway & TTL Decrement.
 * Multi-host routed topology with two complete department LANs:
 * - LAN A (Sales: 192.168.1.0/24): PC-A1 (.1.10) & PC-A2 (.1.11) via Switch-1
 * - Router: Bridges LAN A (.1.1 on enp0s3) and LAN B (.2.1 on enp0s8)
 * - LAN B (Engineering: 192.168.2.0/24): PC-B1 (.2.10) & PC-B2 (.2.11) via Switch-2
 */
function loadScenario2_Routing() {
    resetNetPulseWorkspace();
    const $board = document.querySelector(".board");

    // 1. Create Router in center
    const $router = RouterObject(520, 240);
    $router.setAttribute("ondrop", "dropPackageOverItem(event); dropSwitchOverItem(event);");
    $board.appendChild($router);
    itemIndex++;
    configureInterface($router.id, "192.168.1.1", "255.255.255.0", "enp0s3");
    configureInterface($router.id, "192.168.2.1", "255.255.255.0", "enp0s8");

    // 2. Subnet A (Sales LAN: 192.168.1.0/24)
    const $sw1 = SwitchObject(310, 240);
    $sw1.setAttribute("ondrop", "dropPackageOverItem(event); dropSwitchOverItem(event);");
    $board.appendChild($sw1);
    itemIndex++;

    const $pcA1 = PcObject(100, 130);
    $pcA1.setAttribute("ondrop", "dropPackageOverItem(event); dropSwitchOverItem(event);");
    $board.appendChild($pcA1);
    itemIndex++;
    configureInterface($pcA1.id, "192.168.1.10", "255.255.255.0", "enp0s3");
    setDefaultGateway($pcA1.id, "192.168.1.1");

    const $pcA2 = PcObject(100, 350);
    $pcA2.setAttribute("ondrop", "dropPackageOverItem(event); dropSwitchOverItem(event);");
    $board.appendChild($pcA2);
    itemIndex++;
    configureInterface($pcA2.id, "192.168.1.11", "255.255.255.0", "enp0s3");
    setDefaultGateway($pcA2.id, "192.168.1.1");

    // Wire Subnet A
    wireDeviceToSwitch($pcA1, $sw1, "enp0s3");
    wireDeviceToSwitch($pcA2, $sw1, "enp0s3");
    wireDeviceToSwitch($router, $sw1, "enp0s3");

    // 3. Subnet B (Engineering LAN: 192.168.2.0/24)
    const $sw2 = SwitchObject(730, 240);
    $sw2.setAttribute("ondrop", "dropPackageOverItem(event); dropSwitchOverItem(event);");
    $board.appendChild($sw2);
    itemIndex++;

    const $pcB1 = PcObject(940, 130);
    $pcB1.setAttribute("ondrop", "dropPackageOverItem(event); dropSwitchOverItem(event);");
    $board.appendChild($pcB1);
    itemIndex++;
    configureInterface($pcB1.id, "192.168.2.10", "255.255.255.0", "enp0s3");
    setDefaultGateway($pcB1.id, "192.168.2.1");

    const $pcB2 = PcObject(940, 350);
    $pcB2.setAttribute("ondrop", "dropPackageOverItem(event); dropSwitchOverItem(event);");
    $board.appendChild($pcB2);
    itemIndex++;
    configureInterface($pcB2.id, "192.168.2.11", "255.255.255.0", "enp0s3");
    setDefaultGateway($pcB2.id, "192.168.2.1");

    // Wire Subnet B
    wireDeviceToSwitch($pcB1, $sw2, "enp0s3");
    wireDeviceToSwitch($pcB2, $sw2, "enp0s3");
    wireDeviceToSwitch($router, $sw2, "enp0s8");

    // 4. Annotations
    createScenarioAnnotation(520, 35, "Enterprise Multi-LAN Routing (LAN A: 192.168.1.0/24 <-> Router <-> LAN B: 192.168.2.0/24)");
    createScenarioAnnotation(100, 55, "LAN A (Sales): PC-A1 (.1.10) & PC-A2 (.1.11)");
    createScenarioAnnotation(940, 55, "LAN B (Eng): PC-B1 (.2.10) & PC-B2 (.2.11)");
    createScenarioAnnotation(520, 330, "Router: eth0=192.168.1.1 | eth1=192.168.2.1");
    createScenarioAnnotation(520, 470, "Test 1: PC-A1 pings PC-A2 (Intra-LAN, TTL=64) | Test 2: PC-A1 pings PC-B1 (Inter-LAN via Router, TTL=63)");

    closeScenariosMenu();
    bodyComponent.render(popupMessage("Scenario 2 Loaded: Enterprise Multi-LAN Routing Lab"));
}

/**
 * Scenario 3: Complete Campus Enterprise Lab.
 * Subnet A: Client PC.
 * Router: Bridges Subnet A and Subnet B.
 * Subnet B: DHCP Server, BIND9 DNS Server, Apache Web Server.
 */
function loadScenario3_Enterprise() {
    resetNetPulseWorkspace();
    const $board = document.querySelector(".board");

    // 1. Center Core Router
    const $router = RouterObject(520, 240);
    $router.setAttribute("ondrop", "dropPackageOverItem(event); dropSwitchOverItem(event);");
    $board.appendChild($router);
    itemIndex++;
    configureInterface($router.id, "192.168.1.1", "255.255.255.0", "enp0s3");
    configureInterface($router.id, "192.168.2.1", "255.255.255.0", "enp0s8");

    // 2. Subnet A (Client Access LAN: 192.168.1.0/24)
    const $sw1 = SwitchObject(310, 240);
    $sw1.setAttribute("ondrop", "dropPackageOverItem(event); dropSwitchOverItem(event);");
    $board.appendChild($sw1);
    itemIndex++;

    // 2a. DHCP Server (192.168.1.2)
    const $dhcp = DhcpServerObject(90, 90);
    $dhcp.setAttribute("ondrop", "dropPackageOverItem(event); dropSwitchOverItem(event);");
    $board.appendChild($dhcp);
    itemIndex++;
    configureInterface($dhcp.id, "192.168.1.2", "255.255.255.0", "enp0s3");
    setDefaultGateway($dhcp.id, "192.168.1.1");
    $dhcp.setAttribute("dhcpd", "true");
    $dhcp.setAttribute("dhcp-listen-on-interfaces", "enp0s3");
    $dhcp.setAttribute("data-range-start", "192.168.1.100");
    $dhcp.setAttribute("data-range-end", "192.168.1.200");
    $dhcp.setAttribute("dhcp-offer-netmask", "255.255.255.0");
    $dhcp.setAttribute("dhcp-offer-gateway", "192.168.1.1");
    $dhcp.setAttribute("dhcp-offer-dns", "192.168.2.20");
    $dhcp.setAttribute("dhcp-offer-lease-time", "600");
    wireDeviceToSwitch($dhcp, $sw1, "enp0s3");

    // 2b. Workstation PC (Static Client: 192.168.1.50)
    const $pcClient = PcObject(90, 240);
    $pcClient.setAttribute("ondrop", "dropPackageOverItem(event); dropSwitchOverItem(event);");
    $board.appendChild($pcClient);
    itemIndex++;
    configureInterface($pcClient.id, "192.168.1.50", "255.255.255.0", "enp0s3");
    setDefaultGateway($pcClient.id, "192.168.1.1");
    setDnsServers($pcClient.id, ["192.168.2.20"]);
    wireDeviceToSwitch($pcClient, $sw1, "enp0s3");

    // 2c. Laptop PC (Dynamic DHCP Client - ready for 'dhclient' demo)
    const $laptopClient = PcObject(90, 390);
    $laptopClient.setAttribute("ondrop", "dropPackageOverItem(event); dropSwitchOverItem(event);");
    $board.appendChild($laptopClient);
    itemIndex++;
    installDhclient($laptopClient);
    wireDeviceToSwitch($laptopClient, $sw1, "enp0s3");

    // Wire Core Router to Switch 1
    wireDeviceToSwitch($router, $sw1, "enp0s3");

    // 3. Subnet B (Enterprise Data Center: 192.168.2.0/24)
    const $sw2 = SwitchObject(730, 240);
    $sw2.setAttribute("ondrop", "dropPackageOverItem(event); dropSwitchOverItem(event);");
    $board.appendChild($sw2);
    itemIndex++;

    // 3a. BIND9 DNS Server (192.168.2.20)
    const $dns = DnsServerObject(950, 120);
    $dns.setAttribute("ondrop", "dropPackageOverItem(event); dropSwitchOverItem(event);");
    $board.appendChild($dns);
    itemIndex++;
    configureInterface($dns.id, "192.168.2.20", "255.255.255.0", "enp0s3");
    setDefaultGateway($dns.id, "192.168.2.1");
    $dns.setAttribute("recursion", "true");
    $dns.setAttribute("resolved", "true");
    addDnsEntry($dns.id, new dnsRecord("web.netpulse.local", "A", "192.168.2.50"));
    wireDeviceToSwitch($dns, $sw2, "enp0s3");

    // 3b. Apache2 Web Server (192.168.2.50)
    const $web = PcObject(950, 380);
    $web.setAttribute("ondrop", "dropPackageOverItem(event); dropSwitchOverItem(event);");
    $board.appendChild($web);
    itemIndex++;
    configureInterface($web.id, "192.168.2.50", "255.255.255.0", "enp0s3");
    setDefaultGateway($web.id, "192.168.2.1");
    installApache2($web);
    wireDeviceToSwitch($web, $sw2, "enp0s3");

    // Wire Core Router to Switch 2
    wireDeviceToSwitch($router, $sw2, "enp0s8");

    // 4. Annotations
    createScenarioAnnotation(520, 30, "Campus Enterprise Architecture (LAN A: 192.168.1.0/24 <-> Core Router <-> Data Center: 192.168.2.0/24)");
    createScenarioAnnotation(90, 35, "LAN A: DHCP (.1.2) | Workstation (.1.50) | Laptop (DHCP Client)");
    createScenarioAnnotation(950, 45, "Data Center: BIND9 DNS (.2.20) | Apache2 Web Server (.2.50)");
    createScenarioAnnotation(520, 330, "Core Router: eth0=192.168.1.1 | eth1=192.168.2.1");
    createScenarioAnnotation(520, 470, "Demo 1: Laptop 'dhclient' (DORA) | Demo 2: 'dig web.netpulse.local' | Demo 3: Browser/curl -> http://web.netpulse.local");

    closeScenariosMenu();
    bodyComponent.render(popupMessage("Scenario 3 Loaded: Complete Campus Enterprise Lab"));
}

/**
 * Creates and returns the Scenarios Menu Modal.
 * @returns {HTMLElement} The modal DOM element.
 */function ScenariosMenuModal() {
    const $modal = document.createElement("article");
    $modal.classList.add("scenarios-modal", "draggable-modal", "modal");
    $modal.style.display = "none";
    $modal.style.width = "520px";
    $modal.style.zIndex = "1000";

    $modal.innerHTML = `
        <div class="window-frame">
            <p>NetPulse - Presentation Lab Presets</p>
        </div>

        <div style="padding: 20px; display: flex; flex-direction: column; gap: 16px;">
            <p style="margin: 0; font-size: 13px; color: #64748b; line-height: 1.4;">
                Select a pre-configured scenario to load instantly. Perfect for demonstrating Computer Network concepts seamlessly during presentations.
            </p>

            <div style="display: flex; flex-direction: column; gap: 12px;">
                <!-- Preset 1 -->
                <div style="border: 1px solid #cbd5e1; border-radius: 8px; padding: 14px; background: #f8fafc; cursor: pointer; transition: 0.2s;"
                     onmouseover="this.style.borderColor='#2563eb'; this.style.background='#eff6ff';" 
                     onmouseout="this.style.borderColor='#cbd5e1'; this.style.background='#f8fafc';"
                     onclick="loadScenario1_LAN()">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                        <b style="color: #1e293b; font-size: 14px;">Act 1: LAN & ARP Discovery</b>
                        <span style="background: #2563eb; color: white; font-size: 10px; padding: 2px 8px; border-radius: 12px; font-weight: 600;">Layer 2</span>
                    </div>
                    <p style="margin: 0; font-size: 12px; color: #475569;">
                        2 PCs connected through a Switch. Demonstrates ARP broadcast request, unicast reply, dynamic MAC address table learning, and ICMP Ping.
                    </p>
                </div>

                <!-- Preset 2 -->
                <div style="border: 1px solid #cbd5e1; border-radius: 8px; padding: 14px; background: #f8fafc; cursor: pointer; transition: 0.2s;"
                     onmouseover="this.style.borderColor='#2563eb'; this.style.background='#eff6ff';" 
                     onmouseout="this.style.borderColor='#cbd5e1'; this.style.background='#f8fafc';"
                     onclick="loadScenario2_Routing()">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                        <b style="color: #1e293b; font-size: 14px;">Act 2: Enterprise Multi-LAN Routing & TTL</b>
                        <span style="background: #0284c7; color: white; font-size: 10px; padding: 2px 8px; border-radius: 12px; font-weight: 600;">Layer 3</span>
                    </div>
                    <p style="margin: 0; font-size: 12px; color: #475569;">
                        Multi-host routed network (LAN A Sales vs. LAN B Engineering). Demonstrates Intra-LAN switching (TTL=64) vs. Inter-LAN routing across the router (TTL decrements 64 -> 63) and Traceroute.
                    </p>
                </div>

                <!-- Preset 3 -->
                <div style="border: 1px solid #cbd5e1; border-radius: 8px; padding: 14px; background: #f8fafc; cursor: pointer; transition: 0.2s;"
                     onmouseover="this.style.borderColor='#2563eb'; this.style.background='#eff6ff';" 
                     onmouseout="this.style.borderColor='#cbd5e1'; this.style.background='#f8fafc';"
                     onclick="loadScenario3_Enterprise()">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                        <b style="color: #1e293b; font-size: 14px;">Act 3: Complete Campus Enterprise Lab</b>
                        <span style="background: #16a34a; color: white; font-size: 10px; padding: 2px 8px; border-radius: 12px; font-weight: 600;">L2 - L7</span>
                    </div>
                    <p style="margin: 0; font-size: 12px; color: #475569;">
                        Enterprise campus setup (Client LAN vs. Data Center). Demonstrates DHCP DORA dynamic configuration, BIND9 DNS resolution, TCP 3-way handshake, and Apache2 web delivery via Browser and curl.
                    </p>
                </div>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px;">
                <button class="btn-modern-red" style="padding: 6px 14px;" onclick="resetNetPulseWorkspace(); closeScenariosMenu();">Clear Board</button>
                <button class="btn-modern-blue" style="padding: 6px 16px;" onclick="closeScenariosMenu();">Close</button>
            </div>
        </div>
    `;

    $modal.querySelector(".window-frame").addEventListener("mousedown", dragModal);
    return $modal;
}

/**
 * Opens the Scenarios Menu Modal.
 */
function openScenariosMenu() {
    let $modal = document.querySelector(".scenarios-modal");
    if (!$modal) {
        $modal = ScenariosMenuModal();
        document.body.appendChild($modal);
    }
    $modal.style.display = "block";
    $modal.style.top = "15%";
    $modal.style.left = "calc(50% - 260px)";
}

/**
 * Closes the Scenarios Menu Modal.
 */
function closeScenariosMenu() {
    const $modal = document.querySelector(".scenarios-modal");
    if ($modal) $modal.style.display = "none";
}
