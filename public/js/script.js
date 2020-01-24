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
            this.loadModal();
        },
        watch: {
            modalId: function() {
                // i.e. when the user manually changes the hash, we want to update the modal
                this.loadModal();
            }
        },
        methods: {
            loadModal: function() {
                if (this.modalId) {
                    var vueInstance = this;
                    var imageId = this.modalId;
                    axios.get(`/imageById/${imageId}`).then(function(res) {
                        vueInstance.image = res.data.url;
                        vueInstance.title = res.data.title;
                        vueInstance.description = res.data.description;
                        vueInstance.username = res.data.username;
                        if (res.data === '') {
                            return vueInstance.closeModal();
                        }
                    });
                    axios.get(`/comments/${imageId}`).then(function(res) {
                        for (var i = 0; i < res.data.length; i++) {
                            vueInstance.comments.push(res.data[i]);
                        }
                    });
                }
            },
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
            modalId: location.hash.slice(1),
            lowestIdOnPage: 0,
            showMoreButton: false,
            infiniteScrollTimer: 0,
            stopInfiniteScroll: false,
            isActive: false
        },
        mounted: function() {
            var vueInstance = this;
            if (this.modalId) {
                this.isActive = true;
            }
            this.more();
            addEventListener('hashchange', function() {
                vueInstance.modalId = location.hash.slice(1);
                if (location.hash.slice(1)) {
                    vueInstance.isActive = true;
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
            animateModal: function() {
                this.isActive = true;
            },
            closeModal: function() {
                location.hash = '';
                this.modalId = null;
                this.isActive = false;
            },
            more: function() {
                var vueInstance = this;
                axios
                    .get(`/images/${vueInstance.lowestIdOnPage}`)
                    .then(function(res) {
                        for (var i in res.data) {
                            vueInstance.images.push(res.data[i]);
                        }
                        var oldestImage = vueInstance.images.reduce(function(
                            res,
                            obj
                        ) {
                            if (obj.id < res.id) {
                                return obj;
                            } else {
                                return res;
                            }
                        });
                        vueInstance.lowestIdOnPage = oldestImage.id;
                        if (vueInstance.lowestIdOnPage === res.data[0].id) {
                            // vueInstance.showMoreButton = false;
                            vueInstance.stopInfiniteScroll = true;
                        }
                    })
                    .then(() => {
                        vueInstance.infiniteScroll();
                        if (vueInstance.stopInfiniteScroll) {
                            clearTimeout(vueInstance.infiniteScrollTimer);
                        }
                    });
            },
            infiniteScroll: function() {
                var vueInstance = this;
                var pageBottom =
                    document.documentElement.scrollTop + window.innerHeight >
                    document.documentElement.scrollHeight - 100;

                vueInstance.infiniteScrollTimer = setTimeout(function() {
                    if (pageBottom) {
                        vueInstance.more();
                        // vueInstance.infiniteScroll();
                    } else {
                        vueInstance.infiniteScroll();
                    }
                }, 500);
            }
        }
    });
})();
