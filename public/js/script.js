(() => {
    // Upload Modal
    Vue.component('upload', {
        template: '#upload',
        props: [],
        data: function() {
            return {
                title: null,
                description: null,
                username: null,
                file: null,
                fileName: 'choose file...'
            };
        },
        mounted: function() {},
        methods: {
            handleFile: function(e) {
                this.file = e.target.files[0];
                var fileName = e.target.files[0].name;
                this.fileName = fileName;
                if (this.fileName.length > 20) {
                    this.fileName =
                        fileName.slice(0, 10) + '...' + fileName.slice(-10);
                }
            },
            upload: function(e) {
                e.preventDefault();
                this.closeUpload();
                var formData = new FormData();
                formData.append('title', this.title);
                formData.append('description', this.description);
                formData.append('username', this.username);
                formData.append('file', this.file);

                console.log('sending upload to backend:', formData);

                var vueInstance = this;
                axios
                    .post('/upload', formData)

                    .then(function(res) {
                        vueInstance.$emit('add-new-image', res.data);
                    })
                    .catch(function(err) {
                        console.log('err in POST /upload', err);
                    });
            },
            closeUpload: function() {
                var vueInstance = this;
                vueInstance.$emit('close-upload');
            }
        }
    });

    // Image Modal
    Vue.component('modal', {
        props: ['modalId'],
        data: function() {
            return {
                image: null,
                title: 'Untitled',
                description: 'No Description.',
                username: 'anonymous',
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
                        if (res.data.title === 'null') {
                            vueInstance.title = 'Untitled';
                        } else {
                            vueInstance.title = res.data.title;
                        }
                        if (res.data.description === 'null') {
                            vueInstance.description = 'No description.';
                        } else {
                            vueInstance.description = res.data.description;
                        }
                        if (res.data.username === 'null') {
                            vueInstance.username = 'anonymous';
                        } else {
                            vueInstance.username = res.data.username;
                        }
                        if (res.data === '') {
                            return vueInstance.closeModal();
                        }
                    });
                    axios.get(`/comments/${imageId}`).then(function(res) {
                        for (var i = 0; i < res.data.length; i++) {
                            vueInstance.comments.push(res.data[i]);
                        }
                    });
                    document.documentElement.scrollTop = 0;
                }
            },
            closeModal: function() {
                this.comments = [];
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
                        vueInstance.commentToUpload = {};
                    });
            },
            deleteImg: function() {
                var vueInstance = this;
                axios.post(`/delete/${vueInstance.modalId}`).then(() => {
                    vueInstance.closeModal();
                    vueInstance.$emit(
                        'delete-img-from-vue',
                        vueInstance.modalId
                    );
                });
            }
        }
    });

    // Main
    new Vue({
        el: '#main',
        data: {
            images: [],
            modalId: location.hash.slice(1),
            lowestIdOnPage: 0,
            showMoreButton: false,
            infiniteScrollTimer: 0,
            stopInfiniteScroll: false,
            animateModal: false,
            animateUpload: false
        },
        mounted: function() {
            var vueInstance = this;
            if (this.modalId) {
                this.animateModal = true;
            }
            this.more();
            addEventListener('hashchange', function() {
                vueInstance.modalId = location.hash.slice(1);
                if (location.hash.slice(1)) {
                    vueInstance.animateModal = true;
                }
            });
        },
        methods: {
            modalAnimation: function() {
                this.animateModal = true;
            },
            closeModal: function() {
                location.hash = '';
                this.modalId = null;
                this.animateModal = false;
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
            },
            toggleUpload: function() {
                this.animateUpload = !this.animateUpload;
            },
            addNewImage: function(res) {
                this.images.unshift(res);
            },
            deleteImgFromVue: function(id) {
                for (var i in this.images) {
                    if (this.images[i].id == id) {
                        this.images.splice(i, 1);
                    }
                }
            }
        }
    });
})();
