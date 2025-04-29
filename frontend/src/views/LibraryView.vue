<script setup>
import { RouterLink } from 'vue-router';
import Spinner from '@/components/Spinner.vue';
</script>
<script>
export default {
    props: ['version'],
    data() {
        return {
            loading: true,
            books: null,
        }
    },
    mounted() {
        fetch('/api/user/books', {credentials: 'include'}).then(res => res.json()).then(res => {
            this.books = res;
            this.loading = false;
        });
    }
}
</script>
<template>
    <header>
		<RouterLink to="/logout">Logout</RouterLink>
	</header>
    <RouterLink to="/selector" class="back">&#60; Cambia versione reader</RouterLink>
    <main class="container">
        <RouterLink v-for="book in books" class="book" :key="book.id" :to="'/' + version + '/reader/'+book.id">
            <img :src="book.thumbnail" title="thumbnail" class="thumbnail" />
            <div class="title">{{ book.title }}</div>
            <div class="author">di <b>{{ book.author }}</b></div>
        </RouterLink>
	</main>
    <div v-if="loading" class="overlay">
        <Spinner />
    </div>
</template>
<style scoped>
.back {
    display: block;
    margin: 20px 30px;
}

.container {
    display: grid;
    grid-template-columns: repeat(auto-fill, 300px);
    gap: 50px;
    padding: 50px;
    justify-content: center;
}

.book {
	display: grid;
	grid-template-columns: 1fr;
	grid-template-rows: auto auto 1fr;
	text-align: center;
	width: 300px;
	filter: drop-shadow(0 0 5px #0002);
}

.book .thumbnail {
	height: 400px;
}

.book .title {
	font-size: 24px;
}

.book .author {
	margin-bottom: 32px;
}

.overlay {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #23263490;
}
</style>