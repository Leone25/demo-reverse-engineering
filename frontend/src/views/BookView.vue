<script setup>
import { RouterLink } from 'vue-router';
import Spinner from '../components/Spinner.vue'
</script>
<script>
export default {
	data() {
		return {
			loading: true,
			book: null,
		}
	},
	watch: {
        '$route.params.id': {
            immediate: true,
			handler(id) {
				this.book = null;
				this.loading = true;
				fetch('/api/books/'+id).then(async res => {
					if (res.ok) {
						this.book = await res.json();
						this.loading = false;
					} else {
						this.loading = false;
					}
				});
			}
        }
	}
}
</script>
<template>
	<header>
		<RouterLink to="/login">Accedi all'area privata</RouterLink>
	</header>
	<main class="container">
		<Spinner v-if="loading"/>
		<tempalte v-else-if="book == null" >
			<RouterLink to="/" class="back">&#60; Home</RouterLink>
			<h1 class="not-found">404 - Not Found</h1>
		</tempalte>
		<div v-else class="book">
			<RouterLink to="/" class="back">&#60; Home</RouterLink>
			<img :src="book.thumbnail" title="Thumbnail" class="thumbnail" />
			<div class="data">
				<h1 class="title">{{ book.title }}</h1>
				<h2 class="author"><span class="small">di</span> {{ book.author }}</h2>
				<p class="description">{{ book.description }}</p>
				<p class="date">Prima pubblicazione: <b>{{ book.date }}</b></p>
				<p class="isbn">ISBN: <b>{{ book.id }}</b></p>
			</div>
		</div>
	</main>
	<footer class="code">
		<a href="https://github.com/Leone25/demo-reverse-engineering">View code of Github</a>
	</footer>
</template>
<style scoped>

.back {
	padding: 20px;
	grid-area: back;
}

.container {
	display: flex;
	flex-flow: column nowrap;
	padding: 100px;
	align-content: center;
}

.not-found {
	text-align: center;
}

.book {
	display: grid;
	grid-template-columns: auto 1fr;
	grid-template-areas: 'back back' 'thumbnail data';
	max-width: 1200px;
	gap: 0 40px;
}

.book .thumbnail {
	height: 500px;
	filter: drop-shadow(0 0 5px #0002);
}

.book .description {
	text-align: justify;
}

.code {
	text-align: center;
	padding: 50px;
}
</style>
