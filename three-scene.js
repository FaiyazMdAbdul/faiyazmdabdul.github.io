import * as THREE from 'three';

class ThreeScene {
    constructor() {
        this.container = document.getElementById('three-container');
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.geometry = null;
        this.material = null;
        this.mesh = null;
        this.particles = null;
        this.mouse = { x: 0, y: 0 };
        this.targetRotation = { x: 0, y: 0 };

        this.init();
        this.createScene();
        this.setupEventListeners();
        this.animate();
    }

    init() {
        // Scene
        this.scene = new THREE.Scene();

        // Camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.z = 5;

        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.container.appendChild(this.renderer.domElement);
    }

    createScene() {
        // Create a subtle wireframe torus knot (represents XR/3D complexity)
        const geometry = new THREE.TorusKnotGeometry(1.2, 0.35, 100, 16);

        // Get theme
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

        const material = new THREE.MeshBasicMaterial({
            color: isDark ? 0x6366f1 : 0x8b5cf6,
            wireframe: true,
            transparent: true,
            opacity: 0.15
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.scene.add(this.mesh);

        // Add ambient particles
        this.createParticles(isDark);

        // Add subtle point light
        const light = new THREE.PointLight(0x6366f1, 0.5, 100);
        light.position.set(0, 0, 10);
        this.scene.add(light);
    }

    createParticles(isDark) {
        const particlesGeometry = new THREE.BufferGeometry();
        const particlesCount = 500;
        const positions = new Float32Array(particlesCount * 3);

        for (let i = 0; i < particlesCount * 3; i++) {
            positions[i] = (Math.random() - 0.5) * 20;
        }

        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const particlesMaterial = new THREE.PointsMaterial({
            color: isDark ? 0x6366f1 : 0x8b5cf6,
            size: 0.02,
            transparent: true,
            opacity: 0.3,
            sizeAttenuation: true
        });

        this.particles = new THREE.Points(particlesGeometry, particlesMaterial);
        this.scene.add(this.particles);
    }

    setupEventListeners() {
        // Mouse movement
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        });

        // Window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // Theme change detection
        const observer = new MutationObserver(() => {
            this.updateTheme();
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme']
        });
    }

    updateTheme() {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

        if (this.mesh && this.mesh.material) {
            this.mesh.material.color.setHex(isDark ? 0x6366f1 : 0x8b5cf6);
        }

        if (this.particles && this.particles.material) {
            this.particles.material.color.setHex(isDark ? 0x6366f1 : 0x8b5cf6);
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // Smooth rotation based on mouse position
        this.targetRotation.x = this.mouse.y * 0.3;
        this.targetRotation.y = this.mouse.x * 0.3;

        if (this.mesh) {
            // Subtle auto-rotation
            this.mesh.rotation.x += 0.001;
            this.mesh.rotation.y += 0.002;

            // Add mouse influence
            this.mesh.rotation.x += (this.targetRotation.x - this.mesh.rotation.x) * 0.05;
            this.mesh.rotation.y += (this.targetRotation.y - this.mesh.rotation.y) * 0.05;
        }

        if (this.particles) {
            this.particles.rotation.y += 0.0005;
        }

        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new ThreeScene();
    });
} else {
    new ThreeScene();
}
