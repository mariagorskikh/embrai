// Preloader
window.addEventListener('load', function() {
    const preloader = document.querySelector('.preloader');
    
    if (preloader) {
        // Add a small delay to make the preloader visible even on fast connections
        setTimeout(function() {
            preloader.classList.add('fade-out');
            
            // Remove from DOM after animation completes
            setTimeout(function() {
                preloader.style.display = 'none';
                
                // Trigger entrance animations after preloader is gone
                document.body.classList.add('loaded');
            }, 500);
        }, 1000);
    }
});

document.addEventListener('DOMContentLoaded', function() {
    // Mouse tracking effect
    const cursorEffect = document.querySelector('.cursor-effect');
    
    if (cursorEffect) {
        document.addEventListener('mousemove', function(e) {
            const mouseX = e.clientX;
            const mouseY = e.clientY;
            
            cursorEffect.style.left = mouseX + 'px';
            cursorEffect.style.top = mouseY + 'px';
        });
    }
    
    // Parallax effect for background elements
    document.addEventListener('mousemove', function(e) {
        const parallaxElements = document.querySelectorAll('.parallax-circle');
        
        parallaxElements.forEach(element => {
            const speed = element.getAttribute('data-speed') || 0.1;
            const x = (window.innerWidth - e.pageX * speed) / 100;
            const y = (window.innerHeight - e.pageY * speed) / 100;
            
            element.style.transform = `translateX(${x}px) translateY(${y}px)`;
        });
    });
    
    // Number counter animation
    const counters = document.querySelectorAll('.counter');
    
    function startCounters() {
        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target'));
            const count = +counter.innerText;
            const increment = target / 80; // Speed of count
            
            if (count < target) {
                counter.innerText = Math.ceil(count + increment);
                setTimeout(() => startCounters(), 30);
            } else {
                counter.innerText = target;
                if (target === 100) {
                    counter.innerText = target + '%';
                } else if (target === 6) {
                    counter.innerText = target + '+';
                } else {
                    counter.innerText = target + '%';
                }
            }
        });
    }
    
    // Start counter animation when elements are in view
    const handleIntersection = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (entry.target.classList.contains('counter')) {
                    startCounters();
                }
                
                observer.unobserve(entry.target);
            }
        });
    };
    
    const options = {
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver(handleIntersection, options);
    
    counters.forEach(counter => {
        observer.observe(counter);
    });
    
    // Typing effect for hero heading
    const typingElement = document.querySelector('.typing-effect');
    
    if (typingElement) {
        const text = typingElement.textContent;
        typingElement.textContent = '';
        
        let i = 0;
        const typeInterval = setInterval(() => {
            if (i < text.length) {
                typingElement.textContent += text.charAt(i);
                i++;
            } else {
                clearInterval(typeInterval);
                typingElement.classList.remove('typing-effect');
            }
        }, 100);
    }
    
    // SVG animation
    const svgElements = document.querySelectorAll('.svg-animate');
    
    svgElements.forEach(svg => {
        observer.observe(svg);
    });
    
    // Adding scroll-based animations
    window.addEventListener('scroll', debounce(function() {
        const scrollPosition = window.scrollY;
        
        // Add parallax scrolling to sections
        const sections = document.querySelectorAll('section');
        sections.forEach(section => {
            const distance = section.getBoundingClientRect().top;
            const speed = 0.5;
            const offset = distance * speed;
            
            if (section.querySelector('.parallax-bg')) {
                section.querySelector('.parallax-bg').style.transform = `translateY(${offset}px)`;
            }
        });
    }, 10));
    
    // Debounce function for scroll events
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // Particle effect for footer
    const particlesContainer = document.getElementById('particles-container');
    
    if (particlesContainer) {
        for (let i = 0; i < 50; i++) {
            createParticle(particlesContainer);
        }
    }
    
    function createParticle(container) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        // Random position
        const x = Math.random() * container.offsetWidth;
        const y = Math.random() * container.offsetHeight;
        
        // Random size
        const size = Math.random() * 5 + 2;
        
        // Set styles
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        
        // Random color (using brand colors)
        const colors = ['#2E7DD1', '#7F2BE8', '#32D192'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        particle.style.backgroundColor = randomColor;
        
        // Random opacity
        particle.style.opacity = Math.random() * 0.5 + 0.2;
        
        // Add animation
        const duration = Math.random() * 20 + 10;
        particle.style.animation = `float ${duration}s infinite ease-in-out`;
        
        // Append to container
        container.appendChild(particle);
    }
    
    // Form submit loading animation
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const button = form.querySelector('button[type="submit"]');
            button.classList.add('loading');
        });
    });
    
    // Enhance hover effects for buttons
    const buttons = document.querySelectorAll('.button');
    
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px)';
            this.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.1)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = '';
            this.style.boxShadow = '';
        });
    });
    
    // Enhance hover effects for cards
    const cards = document.querySelectorAll('.tech-card, .stat-card');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px)';
            this.style.boxShadow = '0 15px 30px rgba(0, 0, 0, 0.1)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = '';
            this.style.boxShadow = '';
        });
    });
    
    // Scroll to top when page is refreshed
    window.onbeforeunload = function() {
        window.scrollTo(0, 0);
    };
}); 