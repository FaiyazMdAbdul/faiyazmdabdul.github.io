// =====================
// Audio System
// =====================
class AudioSystem {
    constructor() {
        this.audioContext = null;
        this.audioBuffer = null;
        this.source = null;
        this.gainNode = null;
        this.isPlaying = false;
        this.isMuted = true;

        // Generate ambient sound programmatically
        this.initAudio();
    }

    async initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.gainNode = this.audioContext.createGain();
            this.gainNode.connect(this.audioContext.destination);
            this.gainNode.gain.value = 0.1;
        } catch (error) {
            console.log('Audio not supported');
        }
    }

    createAmbientSound() {
        if (!this.audioContext) return;

        const duration = 4;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(2, duration * sampleRate, sampleRate);

        for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
            const data = buffer.getChannelData(channel);
            for (let i = 0; i < data.length; i++) {
                const t = i / sampleRate;
                // Create ambient pad-like sound with multiple sine waves
                data[i] = (
                    Math.sin(2 * Math.PI * 110 * t) * 0.1 +
                    Math.sin(2 * Math.PI * 165 * t) * 0.08 +
                    Math.sin(2 * Math.PI * 220 * t) * 0.06
                ) * Math.exp(-t * 0.3);
            }
        }

        this.audioBuffer = buffer;
    }

    toggle() {
        if (this.isMuted) {
            this.play();
        } else {
            this.pause();
        }
        this.isMuted = !this.isMuted;
    }

    play() {
        if (!this.audioContext) {
            this.initAudio();
        }

        if (!this.audioBuffer) {
            this.createAmbientSound();
        }

        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        if (!this.isPlaying && this.audioBuffer) {
            // Create a new source each time (Web Audio API requirement)
            this.source = this.audioContext.createBufferSource();
            this.source.buffer = this.audioBuffer;
            this.source.loop = true;
            this.source.connect(this.gainNode);
            this.source.start(0);
            this.isPlaying = true;
        }
    }

    pause() {
        if (this.source && this.isPlaying) {
            try {
                this.source.stop();
            } catch (e) {
                // Source might already be stopped
            }
            this.source = null;
            this.isPlaying = false;
        }
    }

    playClickSound() {
        if (!this.audioContext || this.isMuted) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.value = 800;
        gainNode.gain.value = 0.05;

        oscillator.start();
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
        oscillator.stop(this.audioContext.currentTime + 0.1);
    }

    playHoverSound() {
        if (!this.audioContext || this.isMuted) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.value = 600;
        gainNode.gain.value = 0.03;

        oscillator.start();
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05);
        oscillator.stop(this.audioContext.currentTime + 0.05);
    }
}

// =====================
// Theme Management
// =====================
class ThemeManager {
    constructor() {
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.init();
    }

    init() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        this.updateThemeIcon();
    }

    toggle() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        localStorage.setItem('theme', this.currentTheme);
        this.updateThemeIcon();
    }

    updateThemeIcon() {
        // Icon visibility is handled by CSS
    }
}

// =====================
// Smooth Scroll
// =====================
class SmoothScroll {
    constructor() {
        this.init();
    }

    init() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const href = anchor.getAttribute('href');
                if (href === '#' || href === '#home') {
                    e.preventDefault();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    return;
                }

                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    const offset = 80;
                    const targetPosition = target.offsetTop - offset;
                    window.scrollTo({ top: targetPosition, behavior: 'smooth' });
                }
            });
        });
    }
}

// =====================
// Mobile Navigation
// =====================
class MobileNav {
    constructor() {
        this.toggle = document.getElementById('mobileToggle');
        this.menu = document.querySelector('.nav-menu');
        this.init();
    }

    init() {
        if (!this.toggle || !this.menu) return;

        this.toggle.addEventListener('click', () => {
            this.toggle.classList.toggle('active');
            this.menu.classList.toggle('active');
        });

        // Close menu when clicking on a link
        this.menu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                this.toggle.classList.remove('active');
                this.menu.classList.remove('active');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.toggle.contains(e.target) && !this.menu.contains(e.target)) {
                this.toggle.classList.remove('active');
                this.menu.classList.remove('active');
            }
        });
    }
}

// =====================
// Contact Form Handler
// =====================
class ContactForm {
    constructor() {
        this.form = document.getElementById('contactForm');
        this.resultDiv = document.getElementById('form-result');
        this.init();
    }

    init() {
        if (!this.form) return;

        this.form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitButton = this.form.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            submitButton.textContent = 'Sending...';
            submitButton.disabled = true;

            try {
                const formData = new FormData(this.form);
                const response = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    body: formData
                });

                const data = await response.json();

                if (data.success) {
                    this.showMessage('Thank you for your message! I will get back to you soon.', 'success');
                    this.form.reset();
                } else {
                    this.showMessage('Oops! Something went wrong. Please try again.', 'error');
                }
            } catch (error) {
                this.showMessage('Oops! Something went wrong. Please try again.', 'error');
            } finally {
                submitButton.textContent = originalText;
                submitButton.disabled = false;
            }
        });
    }

    showMessage(message, type) {
        if (!this.resultDiv) return;

        this.resultDiv.textContent = message;
        this.resultDiv.style.display = 'block';
        this.resultDiv.style.padding = '1rem';
        this.resultDiv.style.borderRadius = 'var(--radius-md)';
        this.resultDiv.style.fontSize = '0.9rem';

        if (type === 'success') {
            this.resultDiv.style.background = '#10b981';
            this.resultDiv.style.color = 'white';
        } else {
            this.resultDiv.style.background = '#ef4444';
            this.resultDiv.style.color = 'white';
        }

        setTimeout(() => {
            this.resultDiv.style.display = 'none';
        }, 5000);
    }
}

// =====================
// Interactive Sound Effects
// =====================
class InteractiveSounds {
    constructor(audioSystem) {
        this.audioSystem = audioSystem;
        this.init();
    }

    init() {
        // Add hover sounds to interactive elements
        const hoverElements = document.querySelectorAll(
            '.btn, .nav-link, .project-card, .skill-tag, .social-links a'
        );

        hoverElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                this.audioSystem.playHoverSound();
            });
        });

        // Add click sounds to buttons
        const clickElements = document.querySelectorAll('.btn, button');
        clickElements.forEach(el => {
            el.addEventListener('click', () => {
                this.audioSystem.playClickSound();
            });
        });
    }
}

// =====================
// Navbar Scroll Effect
// =====================
class NavbarScroll {
    constructor() {
        this.nav = document.querySelector('.nav');
        this.init();
    }

    init() {
        if (!this.nav) return;

        let lastScroll = 0;
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;

            if (currentScroll > 100) {
                this.nav.style.boxShadow = 'var(--shadow-md)';
            } else {
                this.nav.style.boxShadow = 'none';
            }

            lastScroll = currentScroll;
        });
    }
}

// =====================
// Initialize Everything
// =====================
document.addEventListener('DOMContentLoaded', () => {
    // Three.js scene is initialized in three-scene.js module

    // Initialize audio system
    const audioSystem = new AudioSystem();
    const audioToggle = document.getElementById('audioToggle');
    if (audioToggle) {
        audioToggle.addEventListener('click', () => {
            audioSystem.toggle();
            audioToggle.classList.toggle('muted');
        });
    }

    // Initialize theme manager
    const themeManager = new ThemeManager();
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            themeManager.toggle();
        });
    }

    // Initialize other features
    new SmoothScroll();
    new MobileNav();
    new ContactForm();
    new InteractiveSounds(audioSystem);
    new NavbarScroll();

    // Add active state to nav links based on scroll position
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.pageYOffset >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.style.color = '';
            if (link.getAttribute('href') === `#${current}`) {
                link.style.color = 'var(--accent-primary)';
            }
        });
    });

    // Theme is already initialized with light mode as default
});

// Handle visibility change for audio
document.addEventListener('visibilitychange', () => {
    const audioSystem = window.audioSystem;
    if (audioSystem) {
        if (document.hidden && audioSystem.isPlaying) {
            audioSystem.pause();
        }
    }
});
