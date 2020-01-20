(() => {
    new Vue({
        el: '#main',
        data: {
            images: null
        },
        mounted: function() {
            var vueInstance = this;
            axios.get('/images').then(function(res) {
                vueInstance.images = res.data;
            });
        }
    });
})();
