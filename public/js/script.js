(() => {
    Vue.component('first-component', {
        template: '#template',
        props: ['postTitle', 'id'],
        data: function() {
            return {
                name: 'David',
                count: 0
            };
        },
        mounted: function() {
            console.log('component mounted');
            console.log('my postTitle:', this.postTitle);
            console.log('id:', this.id);
        },
        methods: {
            closeModal: function() {
                console.log('closeModal fired');
                this.$emit('close', this.count);
            }
        }
    });
    new Vue({
        el: '#main',
        data: {
            selectedFruit: null,
            fruits: [
                {
                    title: '🥝',
                    id: 1
                },
                {
                    title: '🍓',
                    id: 2
                },
                {
                    title: '🍋',
                    id: 3
                }
            ],
            images: [],
            title: '',
            description: '',
            username: '',
            file: null
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
            closeMe: function(count) {
                console.log('closeMe method fired. count: ', count);

                this.selectedFruit = null;
            }
        }
    });
})();
