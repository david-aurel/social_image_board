(() => {
    Vue.component('modal', {
        props: ['modalId'],
        data: function() {
            return {
                test: 'test'
            };
        },
        template: '#modal',
        mounted: function() {
            console.log('modalId:', this.modalId);
        },
        methods: {
            closeModal: function() {
                this.$emit('close');
            }
        }
    });
    new Vue({
        el: '#main',
        data: {
            images: [],
            title: '',
            description: '',
            username: '',
            file: null,
            modalId: false
        },
        mounted: function() {
            var vueInstance = this;
            axios.get('/images').then(function(res) {
                for (var i = res.data.length - 1; i >= 0; i--) {
                    vueInstance.images.push(res.data[i]);
                }
            });
        },
        methods: {
            handleClick: function(e) {
                console.log('vue handleClick happenend');
                e.preventDefault();
                var formData = new FormData();
                formData.append('title', this.title);
                formData.append('description', this.description);
                formData.append('username', this.username);
                formData.append('username', this.username);
                formData.append('file', this.file);

                var vueInstance = this;
                axios
                    .post('/upload', formData)

                    .then(function(res) {
                        console.log('axios POST to /upload happened');
                        console.log('response from POST /upload', res.data);
                        vueInstance.images.unshift(res.data);
                    })
                    .catch(function(err) {
                        console.log('err in POST /upload', err);
                    });
            },
            handleChange: function(e) {
                console.log('handleChange is running');
                console.log('file:', e.target.files[0]);
                this.file = e.target.files[0];
            },
            closeModal: function() {
                this.modalId = null;
            }
        }
    });
})();
