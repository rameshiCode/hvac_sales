export default {
    mounted() {
        this.$nextTick(() => {
            this.observeSections();
        });
    },
    methods: {
        observeSections() {
            const options = {
                rootMargin: "10% 0px -70% 0px",
                threshold: 1,
            };
            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        this.currentSection = entry.target.id;
                        this.$store.state.activeSection = this.currentSection;
                    }
                });
            }, options);
            this.sidebarLinks.forEach((section) => {
                observer.observe(document.querySelector(`#${section.id}`));
            });
        },
    },
}