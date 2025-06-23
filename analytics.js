// Enhanced Google Analytics tracking
// PDF download tracking
document.addEventListener('DOMContentLoaded', function() {
    // Track PDF downloads
    const pdfLinks = document.querySelectorAll('a[href$=".pdf"]');
    pdfLinks.forEach(function(link) {
        link.addEventListener('click', function(e) {
            const fileName = this.href.split('/').pop();
            gtag('event', 'file_download', {
                'file_name': fileName,
                'file_extension': 'pdf',
                'link_text': this.textContent.trim()
            });
        });
    });

    // Track external link clicks
    const externalLinks = document.querySelectorAll('a[href^="http"]:not([href*="nicholasdibella.com"]):not([href*="dibellatron.github.io"])');
    externalLinks.forEach(function(link) {
        link.addEventListener('click', function(e) {
            gtag('event', 'click', {
                'event_category': 'external_link',
                'event_label': this.href,
                'link_text': this.textContent.trim()
            });
        });
    });

    // Track scroll depth
    let maxScroll = 0;
    const scrollMilestones = [25, 50, 75, 90, 100];
    let trackedMilestones = [];

    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = Math.round((scrollTop / docHeight) * 100);

        if (scrollPercent > maxScroll) {
            maxScroll = scrollPercent;
            
            scrollMilestones.forEach(function(milestone) {
                if (scrollPercent >= milestone && !trackedMilestones.includes(milestone)) {
                    trackedMilestones.push(milestone);
                    gtag('event', 'scroll', {
                        'event_category': 'engagement',
                        'event_label': milestone + '%',
                        'value': milestone
                    });
                }
            });
        }
    });

    // Track time on page
    let startTime = Date.now();
    let timeThresholds = [30, 60, 120, 300]; // 30s, 1m, 2m, 5m
    let trackedTimeThresholds = [];

    setInterval(function() {
        const timeOnPage = Math.round((Date.now() - startTime) / 1000);
        
        timeThresholds.forEach(function(threshold) {
            if (timeOnPage >= threshold && !trackedTimeThresholds.includes(threshold)) {
                trackedTimeThresholds.push(threshold);
                gtag('event', 'timing_complete', {
                    'name': 'time_on_page',
                    'value': threshold
                });
            }
        });
    }, 5000); // Check every 5 seconds

    // Track navigation clicks
    const navLinks = document.querySelectorAll('.nav a');
    navLinks.forEach(function(link) {
        link.addEventListener('click', function(e) {
            gtag('event', 'click', {
                'event_category': 'navigation',
                'event_label': this.textContent.trim(),
                'page_location': window.location.href
            });
        });
    });
});