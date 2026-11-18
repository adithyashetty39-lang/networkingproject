# NetPulse — Interactive Computer Network Simulator

## Real-Time Protocol Simulation & Packet Tracing Suite in Pure JavaScript

Developed for Computer Networks Engineering Project & Laboratory

---

## 1. Description

**NetPulse** is a fully interactive, educational computer network engineering simulator built entirely with native web standards (JavaScript ES6+, HTML5, and CSS3). With **zero external runtime libraries or frameworks**, it provides deep hands-on insight into low-level network protocol stacks, packet encapsulation, and real-time packet movement across physical and routed topologies.

---

## 2. Key Features

- **Multi-Layer Protocol Simulation**:
  - **Layer 2 (Data Link)**: Ethernet frames, MAC address learning tables with TTL aging, frame flooding, Address Resolution Protocol (ARP).
  - **Layer 3 (Network)**: IPv4 addressing, CIDR subnetting, multi-homed routers, default gateways, routing tables, longest-prefix matching, TTL decrement, loop prevention, and ICMP (Echo & Time-Exceeded).
  - **Layer 4 (Transport)**: TCP 3-way handshake (`SYN`, `SYN-ACK`, `ACK`), sequence & acknowledgment numbers, UDP transport.
  - **Layer 7 (Application)**: ISC DHCP server (DORA cycle) and DHCP relay, BIND9 DNS server (A, CNAME, NS, SOA records), Apache2 HTTP web server with client browser rendering.
- **Dynamic Routing**: Automatic shortest-path graph calculations and routing table synchronization across multi-hop topologies.
- **State-Aware Firewall**: Built-in `iptables` packet filtering (`INPUT`, `OUTPUT`, `FORWARD`) with live visual fire drop indicators.
- **Interactive Tools**:
  - **1-Click Presentation Presets**: Instantly load pre-configured network topologies for live demonstrations (LAN & ARP, Inter-Subnet Routing, Campus Enterprise Lab).
  - **Subnet & CIDR Calculator**: Both CLI (`subnet <cidr>`) and interactive GUI modal for instant IP range, wildcard mask, and binary breakdown.
  - **Linux Terminal**: Fully interactive shell supporting `ping`, `traceroute`, `ip`, `arp`, `dig`, `subnet`, `systemctl`, `nano`, and filesystem operations.
  - **Simulated Web Browser**: Render HTTP web pages and query domain names through simulated DNS.
  - **Packet Tracer & OSI Inspector**: Real-time traffic sniffer with 7-layer OSI field decodes.

---

## 3. Network Devices

- Workstations & PCs
- Ethernet Switches (L2 MAC learning)
- Multi-Homed Routers (IPv4 forwarding)
- ISC DHCP Servers & DHCP Relay Agents
- BIND9 DNS Servers
- Apache2 Web Servers

---

## 4. How to Run

1. Open `index.html` directly in any modern web browser (Chrome, Edge, Firefox).
2. Or run via local development server:
   ```bash
   npm install
   npm run dev
   ```

---

## 5. Built-in Presentation Scenarios

Use the **Presets** button in the bottom panel to load any demonstration instantly:
1. **Act 1: LAN & ARP Discovery** — Demonstrates ARP broadcast request, unicast reply, switch MAC table learning, and ICMP Ping.
2. **Act 2: Inter-Subnet Routing & TTL** — Demonstrates multi-subnet routing, default gateways, routing table lookup, TTL decrement ($64 \to 63$), and traceroute.
3. **Act 3: Complete Campus Enterprise Lab** — Demonstrates DHCP DORA, BIND9 DNS resolution, TCP 3-way handshake, and Apache2 HTTP browser delivery.
