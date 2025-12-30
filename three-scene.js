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
        this.camera.position.z = 8;

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
        // Get theme
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const wireframeColor = isDark ? 0xFFFFFF : 0x000000;

        // Create VR headset wireframe from primitives
        const headsetGroup = new THREE.Group();

        // Main headset body (box)
        const bodyGeometry = new THREE.BoxGeometry(3, 1.5, 1.5);
        const wireframeMaterial = new THREE.MeshBasicMaterial({
            color: wireframeColor,
            wireframe: true,
            transparent: false
        });
        const bodyMesh = new THREE.Mesh(bodyGeometry, wireframeMaterial);
        headsetGroup.add(bodyMesh);

        // Left eye lens (cylinder)
        const lensGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16);
        const leftLens = new THREE.Mesh(lensGeometry, wireframeMaterial.clone());
        leftLens.rotation.z = Math.PI / 2;
        leftLens.position.set(-0.6, 0, 0.9);
        headsetGroup.add(leftLens);

        // Right eye lens (cylinder)
        const rightLens = new THREE.Mesh(lensGeometry, wireframeMaterial.clone());
        rightLens.rotation.z = Math.PI / 2;
        rightLens.position.set(0.6, 0, 0.9);
        headsetGroup.add(rightLens);

        // Head strap (torus - partial arc)
        const strapGeometry = new THREE.TorusGeometry(1.8, 0.08, 8, 32, Math.PI);
        const strap = new THREE.Mesh(strapGeometry, wireframeMaterial.clone());
        strap.rotation.y = Math.PI / 2;
        strap.position.set(0, 0, 0);
        headsetGroup.add(strap);

        // Scale down and position the headset
        headsetGroup.scale.set(0.6, 0.6, 0.6);
        headsetGroup.position.set(2, -1, 0);

        this.mesh = headsetGroup;
        this.scene.add(this.mesh);

        // Add grid floor (much lower and with reduced opacity)
        const gridHelper = new THREE.GridHelper(20, 20, wireframeColor, wireframeColor);
        gridHelper.position.y = -8;
        gridHelper.material.opacity = 0.3;
        gridHelper.material.transparent = true;
        this.scene.add(gridHelper);

        // Add coordinate axes (X: red, Y: green, Z: blue)
        const axesHelper = new THREE.AxesHelper(2);
        axesHelper.position.set(-8, -7, 0);
        this.scene.add(axesHelper);
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
        const wireframeColor = isDark ? 0xFFFFFF : 0x000000;

        // Update all materials in the headset group
        if (this.mesh && this.mesh.children) {
            this.mesh.children.forEach(child => {
                if (child.material) {
                    child.material.color.setHex(wireframeColor);
                }
            });
        }

        // Update grid helper color and maintain opacity
        const gridHelper = this.scene.children.find(child => child.type === 'GridHelper');
        if (gridHelper) {
            gridHelper.material.color.setHex(wireframeColor);
            gridHelper.material.opacity = 0.3;
            gridHelper.material.transparent = true;
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // Rotation based on mouse position
        this.targetRotation.x = this.mouse.y * 0.3;
        this.targetRotation.y = this.mouse.x * 0.3;

        if (this.mesh) {
            // Subtle auto-rotation
            this.mesh.rotation.x += 0.002;
            this.mesh.rotation.y += 0.003;

            // Add mouse influence
            this.mesh.rotation.x += (this.targetRotation.x - this.mesh.rotation.x) * 0.05;
            this.mesh.rotation.y += (this.targetRotation.y - this.mesh.rotation.y) * 0.05;
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
