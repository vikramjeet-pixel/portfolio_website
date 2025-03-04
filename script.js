// Initialize EmailJS
emailjs.init("iUQi0vu4gzI-yoS-n"); // Replace with your EmailJS User ID

// Register GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// Theme Toggle with Animation
const themeToggle = document.getElementById('theme-toggle');
themeToggle.addEventListener('click', () => {
    const html = document.documentElement;
    html.classList.toggle('dark-mode');
    html.classList.toggle('light-mode');
    
    gsap.to('body', {
        opacity: 0,
        duration: 0.2,
        ease: 'power2.in',
        onComplete: () => {
            gsap.to('body', {
                opacity: 1,
                duration: 0.3,
                ease: 'power2.out'
            });
        }
    });

    const icon = themeToggle.querySelector('i');
    icon.classList.toggle('fa-moon');
    icon.classList.toggle('fa-sun');
});

// Hamburger Menu
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    hamburger.querySelector('i').classList.toggle('fa-bars');
    hamburger.querySelector('i').classList.toggle('fa-times');
});

// Smooth Scroll
document.querySelectorAll('.scroll-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(link.getAttribute('href'));
        target.scrollIntoView({ behavior: 'smooth' });
        navLinks.classList.remove('active');
        hamburger.querySelector('i').classList.remove('fa-times');
        hamburger.querySelector('i').classList.add('fa-bars');
    });
});

// Three.js 3D Animation
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
const canvasContainer = document.getElementById('three-canvas');
if (canvasContainer) {
    canvasContainer.appendChild(renderer.domElement);
} else {
    console.error("Canvas container '#three-canvas' not found!");
}

// Central Rotating Sphere (Larger Size)
const sphereGeometry = new THREE.SphereGeometry(10, 32, 32); // Increased radius to 10
const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0x6b5b95, wireframe: true });
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
scene.add(sphere);

// Rotating Torus (Larger Size)
const torusGeometry = new THREE.TorusGeometry(13, 1.5, 16, 100); // Increased radius to 15, tube to 1.5
const torusMaterial = new THREE.MeshBasicMaterial({ color: 0x88b7d5, wireframe: true });
const torus = new THREE.Mesh(torusGeometry, torusMaterial);
torus.position.z = -2; // Slightly behind the sphere
scene.add(torus);

// Orbiting Particles (Larger Size)
const particleCount = 1000;
const particles = new THREE.Group();
for (let i = 0; i < particleCount; i++) {
    const particleGeometry = new THREE.SphereGeometry(0.1, 16, 16); // Increased radius to 0.3
    const particleMaterial = new THREE.MeshBasicMaterial({ color: 0x88b7d5 });
    const particle = new THREE.Mesh(particleGeometry, particleMaterial);
    
    const angle = (i / particleCount) * Math.PI * 2;
    const radius = 12 + Math.random() * 1000; // Increased radius to 12
    particle.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        Math.random() * 2 - 1
    );
    particle.userData = { angle, radius, speed: 0.02 + Math.random() * 0.03 };
    particles.add(particle);
}
scene.add(particles);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set(10, 10, 10);
scene.add(pointLight);

camera.position.z = 50; // Adjusted for larger objects

// Cursor Interaction
const cursor = { x: 0, y: 0 };
window.addEventListener('mousemove', (event) => {
    // Normalize cursor position to [-1, 1] range
    cursor.x = (event.clientX / window.innerWidth) * 2 - 1;
    cursor.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

// Animation Loop
let time = 0;
function animate() {
    requestAnimationFrame(animate);
    
    // Update 3D objects based on cursor position
    sphere.position.x = cursor.x * 5; // Move sphere horizontally
    sphere.position.y = cursor.y * 5; // Move sphere vertically

    torus.position.x = cursor.x * 3; // Move torus horizontally
    torus.position.y = cursor.y * 3; // Move torus vertically

    particles.position.x = cursor.x * 2; // Move particles horizontally
    particles.position.y = cursor.y * 2; // Move particles vertically

    // Rotate Sphere
    sphere.rotation.x += 0.01;
    sphere.rotation.y += 0.01;

    // Rotate Torus
    torus.rotation.x -= 0.015;
    torus.rotation.y += 0.015;

    // Orbit Particles
    particles.children.forEach(particle => {
        particle.userData.angle += particle.userData.speed;
        particle.position.x = Math.cos(particle.userData.angle) * particle.userData.radius;
        particle.position.y = Math.sin(particle.userData.angle) * particle.userData.radius;
        particle.position.z = Math.sin(time + particle.userData.angle) * 2;
    });

    // Subtle Floating Effect
    scene.position.y = Math.sin(time) * 0.5;

    time += 0.02;
    renderer.render(scene, camera);
}
animate();

// Resize Handler
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

// Floating Name Animation
const nameElement = document.getElementById('floating-name');
const nameText = "Vikramjeet Singh";
nameElement.innerHTML = nameText.split('').map(char => `<span>${char}</span>`).join('');

const spans = nameElement.querySelectorAll('span');
document.addEventListener('mousemove', (e) => {
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    spans.forEach((span, index) => {
        const rect = span.getBoundingClientRect();
        const spanX = rect.left + rect.width / 2;
        const spanY = rect.top + rect.height / 2;

        const distance = Math.sqrt((mouseX - spanX) ** 2 + (mouseY - spanY) ** 2);
        const maxDistance = 100;
        const floatStrength = Math.max(0, (maxDistance - distance) / maxDistance) * 20;

        gsap.to(span, {
            y: -floatStrength,
            duration: 0.3,
            ease: 'power2.out',
            overwrite: 'auto'
        });
    });
});

// GSAP Animations
gsap.from(".navbar", { y: -100, duration: 1, ease: "power2.out" });
gsap.from(".hero-content p", { opacity: 0, y: 50, duration: 1, delay: 0.7, ease: "power2.out" });
gsap.from(".cta-btn", { opacity: 0, scale: 0.8, duration: 1, delay: 1, ease: "back.out(1.7)" });

gsap.utils.toArray(".education-card").forEach(card => {
    gsap.from(card, {
        opacity: 0,
        y: 100,
        duration: 1,
        scrollTrigger: {
            trigger: card,
            start: "top 80%",
            ease: "power2.out"
        }
    });
});

gsap.utils.toArray(".skill-item").forEach(item => {
    gsap.from(item, {
        opacity: 0,
        y: 50,
        duration: 0.8,
        scrollTrigger: {
            trigger: item,
            start: "top 80%",
            ease: "power2.out"
        }
    });
});

gsap.utils.toArray(".project-card").forEach(card => {
    gsap.from(card, {
        opacity: 0,
        y: 100,
        duration: 1,
        scrollTrigger: {
            trigger: card,
            start: "top 80%",
            ease: "power2.out"
        }
    });
});

gsap.from(".social-icons a", {
    opacity: 0,
    stagger: 0.2,
    duration: 0.5,
    scrollTrigger: {
        trigger: ".connect",
        start: "top 80%",
        ease: "power2.out"
    }
});

// Contact Form Submission with Toast
document.getElementById('contact-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const formMessage = document.getElementById('form-message');
    const toast = document.getElementById('toast');
    formMessage.textContent = 'Sending...';

    emailjs.sendForm('service_1m40uhy', 'template_e003nvr', this)
        .then(() => {
            formMessage.textContent = '';
            this.reset();
            toast.textContent = 'Message Sent Successfully!';
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
            }, 3000);
        }, (error) => {
            formMessage.textContent = 'Failed to send message. Please try again.';
            console.error('EmailJS Error:', error);
        });
});