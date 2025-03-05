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

// Smooth Scroll for Scroll Links
document.querySelectorAll('.scroll-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('data-href') || link.getAttribute('href');
        const target = document.querySelector(targetId);
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
            navLinks.classList.remove('active');
            hamburger.querySelector('i').classList.remove('fa-times');
            hamburger.querySelector('i').classList.add('fa-bars');
        }
    });
});

// Three.js 3D Animation (Slow Star-like Particles)
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

const particleCount = 5000;
const particles = new THREE.Group();
const trailGeometry = new THREE.BufferGeometry();
const trailPositions = new Float32Array(particleCount * 3 * 10);
const trailColors = new Float32Array(particleCount * 3 * 10);
const trailMaterial = new THREE.LineBasicMaterial({ vertexColors: true, blending: THREE.AdditiveBlending, transparent: true });
const trails = new THREE.LineSegments(trailGeometry, trailMaterial);

for (let i = 0; i < particleCount; i++) {
    const particleGeometry = new THREE.SphereGeometry(0.1, 16, 16); // Small size for star-like dots
    const particleMaterial = new THREE.MeshBasicMaterial({ color: getComputedStyle(document.documentElement).getPropertyValue('--particle-color').trim() });
    const particle = new THREE.Mesh(particleGeometry, particleMaterial);
    const angle = (i / particleCount) * Math.PI * 2;
    const radius = 12 + Math.random() * 1000; // Spread particles across a wide area
    particle.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, Math.random() * 2 - 1);
    particle.userData = { 
        angle, 
        radius, 
        speed: 0.0005 + Math.random() * 0.001, // Slower speed range: 0.0005 to 0.0015
        trail: new Array(10).fill().map(() => ({ x: 0, y: 0, z: 0 })),
        clusterOffset: Math.random() * Math.PI * 2 // Retained for initial positioning
    };
    particles.add(particle);
}
scene.add(particles);
scene.add(trails);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(10, 10, 10);
scene.add(directionalLight);

camera.position.z = 50;

const controls = { x: 0, y: 0 };

window.addEventListener('mousemove', (event) => {
    controls.x = (event.clientX / window.innerWidth) * 2 - 1;
    controls.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

let hasOrientationPermission = false;
function requestDeviceOrientation() {
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission()
            .then(permissionState => {
                if (permissionState === 'granted') {
                    hasOrientationPermission = true;
                    window.addEventListener('deviceorientation', handleOrientation);
                }
            })
            .catch(console.error);
    } else {
        hasOrientationPermission = true;
        window.addEventListener('deviceorientation', handleOrientation);
    }
}

function handleOrientation(event) {
    if (!event.beta || !event.gamma) return;
    const tiltX = event.gamma / 45;
    const tiltY = (event.beta - 90) / 45;
    controls.x = THREE.MathUtils.lerp(controls.x, Math.max(-1, Math.min(1, tiltX)), 0.1);
    controls.y = THREE.MathUtils.lerp(controls.y, Math.max(-1, Math.min(1, tiltY)), 0.1);
}

if (/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    canvasContainer.addEventListener('click', requestDeviceOrientation, { once: true });
}

let time = 0;
function animate() {
    requestAnimationFrame(animate);
    
    // Update particle positions only, slower and without clustering
    particles.position.x = controls.x * 2;
    particles.position.y = controls.y * 2;

    const positions = [];
    const colors = [];
    const particleColor = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--particle-color').trim().replace('#', ''), 16);
    
    particles.children.forEach((particle, i) => {
        particle.userData.angle += particle.userData.speed; // Slow angular movement
        const x = Math.cos(particle.userData.angle) * particle.userData.radius;
        const y = Math.sin(particle.userData.angle) * particle.userData.radius;
        const z = particle.position.z; // Keep z static for a 2D starfield effect
        
        particle.position.set(x, y, z);
        particle.material.color.setHex(particleColor);
        
        particle.userData.trail.unshift({ x, y, z });
        particle.userData.trail.pop();
        
        const r = (particleColor >> 16 & 255) / 255;
        const g = (particleColor >> 8 & 255) / 255;
        const b = (particleColor & 255) / 255;
        
        for (let j = 0; j < particle.userData.trail.length - 1; j++) {
            const alpha = 1 - (j / particle.userData.trail.length);
            positions.push(
                particle.userData.trail[j].x,
                particle.userData.trail[j].y,
                particle.userData.trail[j].z,
                particle.userData.trail[j + 1].x,
                particle.userData.trail[j + 1].y,
                particle.userData.trail[j + 1].z
            );
            colors.push(r, g, b, alpha, r, g, b, alpha * 0.8);
        }
    });
    
    trailGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
    trailGeometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 4));
    trailGeometry.attributes.position.needsUpdate = true;
    trailGeometry.attributes.color.needsUpdate = true;

    directionalLight.position.x = Math.sin(time) * 20;
    directionalLight.position.y = Math.cos(time) * 20;
    scene.position.y = Math.sin(time) * 0.5;

    time += 0.02;
    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

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
gsap.from(".cta-btn", { opacity: 0, scale: 0.8, duration: 1, delay: 1, ease: "back.out(1.7)", stagger: 0.2 });

gsap.utils.toArray(".education-card").forEach(card => {
    gsap.from(card, { opacity: 0, y: 100, duration: 1, scrollTrigger: { trigger: card, start: "top 80%", ease: "power2.out" } });
});
gsap.utils.toArray(".skill-item").forEach(item => {
    gsap.from(item, { opacity: 0, y: 50, duration: 0.8, scrollTrigger: { trigger: item, start: "top 80%", ease: "power2.out" } });
});
gsap.utils.toArray(".project-card").forEach(card => {
    gsap.from(card, { opacity: 0, y: 100, duration: 1, scrollTrigger: { trigger: card, start: "top 80%", ease: "power2.out" } });
});
gsap.utils.toArray(".certification-card").forEach(card => {
    gsap.from(card, { opacity: 0, y: 100, duration: 1, scrollTrigger: { trigger: card, start: "top 80%", ease: "power2.out" } });
});
gsap.from(".social-icons a", { opacity: 0, stagger: 0.2, duration: 0.5, scrollTrigger: { trigger: ".connect", start: "top 80%", ease: "power2.out" } });

// Certification Card Interactivity
document.querySelectorAll('.certification-card').forEach(card => {
    card.addEventListener('click', () => {
        const description = card.querySelector('.cert-description');
        const link = card.querySelector('.cert-link');
        const isActive = card.classList.contains('active');

        card.classList.toggle('active');

        if (isActive) {
            gsap.to([description, link], {
                opacity: 0,
                height: 0,
                duration: 0.3,
                ease: 'power2.in',
                onComplete: () => {
                    description.classList.add('hidden');
                    link.classList.add('hidden');
                }
            });
        } else {
            description.classList.remove('hidden');
            link.classList.remove('hidden');
            gsap.fromTo([description, link], 
                { opacity: 0, height: 0 },
                { opacity: 1, height: 'auto', duration: 0.3, ease: 'power2.out' }
            );
        }
    });
});

// Contact Form Submission with Toast
document.addEventListener('DOMContentLoaded', () => {
    if (typeof emailjs === 'undefined') {
        console.error('EmailJS library not loaded. Check the script source in HTML.');
        document.getElementById('form-message').textContent = 'Email service unavailable.';
        return;
    }

    emailjs.init("CBO9xSBT9kIQYL35e"); // Replace with your actual public key

    const form = document.getElementById('contact-form');
    const formMessage = document.getElementById('form-message');
    const toast = document.getElementById('toast');
    const formBtn = form.querySelector('.form-btn');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        formBtn.classList.add('loading');
        formMessage.textContent = 'Sending...';

        try {
            const result = await emailjs.sendForm('service_5ww4pg9', 'template_f5pfu3u', form); // Replace with your actual IDs
            formMessage.textContent = '';
            form.reset();
            showToast('Message Sent Successfully!', '#4caf50');
        } catch (error) {
            let errorMsg = 'Failed to send message. Please try again later.';
            if (error.status === 401) {
                errorMsg = 'Invalid EmailJS credentials. Contact the developer.';
            } else if (error.text) {
                errorMsg = `Error: ${error.text}`;
            }
            formMessage.textContent = errorMsg;
            showToast('Failed to Send Message', '#f44336');
            console.error('EmailJS Error:', error);
        } finally {
            formBtn.classList.remove('loading');
        }
    });

    function showToast(message, bgColor) {
        toast.textContent = message;
        toast.style.background = bgColor;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    }
});