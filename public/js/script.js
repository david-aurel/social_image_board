(() => {
    Vue.component('modal', {
        props: ['modalId'],
        data: function() {
            return {
                image: null,
                title: null,
                description: null,
                username: null,
                comments: [],
                commentToUpload: {}
            };
        },
        template: '#modal',
        mounted: function() {
            var vueInstance = this;
            var imageId = this.modalId;
            axios.get(`/imageById/${imageId}`).then(function(res) {
                vueInstance.image = res.data.url;
                vueInstance.title = res.data.title;
                vueInstance.description = res.data.description;
                vueInstance.username = res.data.username;
            });
            axios.get(`/comments/${imageId}`).then(function(res) {
                for (var i = 0; i < res.data.length; i++) {
                    vueInstance.comments.push(res.data[i]);
                }
            });
        },
        methods: {
            closeModal: function() {
                this.$emit('close');
            },
            comment: function(e) {
                e.preventDefault();
                var vueInstance = this;
                var comment = this.commentToUpload.comment;
                var username = this.commentToUpload.username;
                var imageId = this.modalId;
                axios
                    .post(`/comment/${comment}/${username}/${imageId}`)
                    .then(function(res) {
                        vueInstance.comments.push(res.data);
                    });
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
            upload: function(e) {
                e.preventDefault();
                var formData = new FormData();
                formData.append('title', this.title);
                formData.append('description', this.description);
                formData.append('username', this.username);

                formData.append('file', this.file);

                var vueInstance = this;
                axios
                    .post('/upload', formData)

                    .then(function(res) {
                        vueInstance.images.unshift(res.data);
                    })
                    .catch(function(err) {
                        console.log('err in POST /upload', err);
                    });
            },
            handleFile: function(e) {
                this.file = e.target.files[0];
            },
            closeModal: function() {
                this.modalId = null;
            }
        }
    });
})();
