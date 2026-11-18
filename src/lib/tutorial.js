/**
 * @description Represents a single slide in a tutorial presentation, containing a title, media
 * asset URL, and HTML content text.
 */
class slide {
    /**
     * @param {string} [title=""] - Slide title displayed as an `<h1>`.
     * @param {string} [media=""] - URL of the image to display in the slide.
     * @param {string} [text=""] - HTML content string for the slide body.
     */
    constructor(title, media, text ) {
        this.title = title || "";
        this.media = media || "";
        this.content = text || "";
        this.mediaHeight = "200px";
        this.mediaBackgroundColor = "transparent";
        this.mediaShadow = "0 15px 35px rgba(0, 0, 0, 0.2)";
    }
}

/**
 * @description Manages a modal slide-show presentation. Slides are added via `addSlide`, rendered
 * into the DOM by `startPresentation`, navigated with `render`, and dismissed with `endPresentation`.
 */
class slidePresentation {

    constructor() {
        this.slides = [];
        this.currentSlide = 0;
        this.isRendered = false;
    }

    /**
     * @description Appends one or more `slide` instances to the presentation's slide list.
     * @param {...slide} slides - Slides to add.
     * @returns {void}
     */
    addSlide(...slides) {
        this.slides.push(...slides);
    }

    /**
     * @description Builds and injects the full slide-presentation HTML into the DOM, shows the
     * modal overlay, and displays the first slide.
     * @returns {void}
     */
    startPresentation() {

        const $slidePresentationHTML = document.createElement('div');

        $slidePresentationHTML.classList.add('slide-presentation');

        $slidePresentationHTML.innerHTML = `
            ${
                this.slides.map((slide, index) => {

                    const slideStyle = `
                        height: ${slide.mediaHeight};
                        background-color: ${slide.mediaBackgroundColor};
                        box-shadow: ${slide.mediaShadow};
                    `;

                    return `<div class="slide" id="slide-${index}">
                        <h1 class="slide__title">${slide.title}</h1>
                        <div class="main-content">
                            <img class="slide__media" src="${slide.media}" style="${slideStyle}" alt="media">
                            <p class="slide__content">${slide.content}</p>
                        </div>
                    </div>`;

                }).join('')
            }

            <div class="page-selector">
                ${
                    this.slides.map((slide, index) => {
                        return `<button class="page-selector__btn" onclick="tutorial.render(${index});">${index + 1}</button>`;
                    }).join('')
                }
                <img class="next-slide-btn" src="./assets/tutorial/next.svg" alt="next" onclick="tutorial.render(tutorial.currentSlide + 1);">
                <button class="end-presentation btn-modern-blue" onclick="tutorial.endPresentation();">Done!</button>
            </div>
            <div class="links">
                <span style="font-size: 12px; color: #64748b; font-weight: 600;">NetPulse Network Simulator</span>
            </div>
        `;

        $slidePresentationHTML.querySelectorAll('.slide').forEach( $slide => $slide.classList.add('hidden') );
        $slidePresentationHTML.querySelectorAll('.slide')[0].classList.remove('hidden');
        $slidePresentationHTML.querySelectorAll('.page-selector__btn')[0].classList.add('active');
        document.querySelector(".modal-overlay").style.display = "block";
        bodyComponent.render($slidePresentationHTML);

        this.isRendered = true;
    }

    /**
     * @description Navigates to the slide at `slideIndex`. Loops to 0 when passing the end,
     * updates active indicators on the page selector buttons, and reveals the selected slide.
     * @param {number} slideIndex - Zero-based index of the slide to display.
     * @returns {void}
     */
    render(slideIndex) {

        if (slideIndex > this.slides.length - 1) slideIndex = 0;

        const $slidePresentationHTML = $('.slide-presentation');
        const $slides = $$('.slide', $slidePresentationHTML);
        const $pageSelectors = $$('.page-selector__btn', $slidePresentationHTML);
        const $currentSlide = $slides[slideIndex];

        $pageSelectors.forEach($selector => $selector.classList.remove('active'));
        $pageSelectors[slideIndex].classList.add('active');

        $slides.forEach($slide => $slide.classList.add('hidden'));
        $currentSlide.classList.remove('hidden');

        this.currentSlide = slideIndex;

    }

    /**
     * @description Dismisses the presentation by animating the modal out, removing it from the
     * DOM, hiding the modal overlay, and recording `"tutorial-seen"` in `localStorage`.
     * @returns {void}
     */
    endPresentation() {

        const $slidePresentationHTML = $('.slide-presentation');
        $slidePresentationHTML.style.animation = 'scale-down 0.2s ease forwards';

        setTimeout(() => {
            $slidePresentationHTML.remove();
            this.isRendered = false;
        }, 300);

        document.querySelector(".modal-overlay").style.display = "none";
        localStorage.setItem("tutorial-seen", "true");

    }

}

const introductionSlide = new slide(
  'Welcome to NetPulse 🌐',
  './assets/favicon.svg',
  `NetPulse is an interactive Computer Networks engineering platform designed to simulate, analyze, and visualize network protocols in real time.
    In this environment, you can design multi-subnet topologies, inspect live packet flows, configure Linux network daemons, and test protocol behaviors hands-on.`
);

introductionSlide.mediaShadow = "none";

const createAndConnectDevicesSlide = new slide(
  'Create and Connect Devices 💻',
  './assets/tutorial/slide1.gif',
  `To create a device, drag it from the bottom panel onto the workspace.
  You can place PCs, switches, routers, DHCP servers, and DNS servers. Each device has full Linux network stack configuration.
  Connect devices with cables to form local or multi-hop inter-network topologies.`
);

const configureDevicesSlide = new slide(
  'Device Configuration ⚙️',
  './assets/tutorial/slideDeviceSettings.gif',
  `Click on any device to access its configuration options.
  Configure IP addresses, subnet masks, default gateways, routing tables, and daemon services directly.`
);

const testNetworkSlide = new slide(
  'Connectivity & Protocol Testing 📡',
  './assets/tutorial/slidePing.gif',
  `Once devices are connected and configured,
  test connectivity with <code>ping</code> or <code>traceroute</code> between hosts. Watch ARP resolution and ICMP Echo packets traverse the network visually in real time.`
);

const terminalSlide = new slide(
  'Integrated Linux Terminal 🗔',
  './assets/tutorial/slideTerminal.gif',
  `The integrated terminal gives full command-line interaction with each device's network stack.
  Use commands like <code>ping</code>, <code>ip</code>, <code>ifup</code>, <code>arp</code>, <code>dig</code>, <code>subnet</code>, and <code>iptables</code>.
  Perform virtual filesystem operations with <code>ls</code>, <code>cat</code>, <code>mkdir</code>, or <code>nano</code>.`
);

terminalSlide.mediaHeight = "250px";

const installPackagesSlide = new slide(
  'Daemon Services & Packages 📦',
  './assets/tutorial/slidePaquetes.gif',
  `Install and configure industry-standard daemons using <code>apt</code> from the terminal or by dragging packages onto devices (ISC DHCP Server, BIND9 DNS, Apache2 Web Server, and iptables firewall).`
);

installPackagesSlide.mediaHeight = "250px";

const nowItsYourTurnSlide = new slide(
  'Presentation Ready! 🚀',
  './assets/tutorial/lastSlide.jpg',
  `Use the bottom panel to explore the built-in <b>1-Click Demo Scenarios</b> for instant presentation setups, inspect captured traffic with the <b>Packet Tracer</b>, and calculate network ranges with the <b>Subnet Calculator</b>!`
);

const creditsSlide = new slide(
  'About NetPulse 🎓',
  './assets/favicon.svg',
  `NetPulse — Computer Networks Engineering Project Simulator.<br><br>
  Built with native web technologies (vanilla ES6+, HTML5, CSS3) featuring zero external runtime frameworks, real-time SVG packet animation, complete OSI layer tracking, and simulated Linux network daemons.`
);

creditsSlide.mediaShadow = "none";

const tutorial = new slidePresentation();

tutorial.addSlide(
    introductionSlide,
    createAndConnectDevicesSlide,
    configureDevicesSlide,
    terminalSlide,
    testNetworkSlide,
    installPackagesSlide,
    nowItsYourTurnSlide,
    creditsSlide
);

/**
 * @description Starts the tutorial slide presentation.
 * @returns {void}
 */
function startTutorial() {
    tutorial.startPresentation();
}
