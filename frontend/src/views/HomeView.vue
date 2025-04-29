<script setup>
import { RouterLink } from 'vue-router';
import Spinner from '../components/Spinner.vue'
import 'vue3-carousel/carousel.css';
import { Carousel, Slide, Pagination, Navigation } from 'vue3-carousel';
</script>
<script>
export default {
	data() {
		return {
			popularBooks: null,
		}
	},
	mounted() {
		fetch('/api/books').then(res => res.json()).then(res => {
			this.popularBooks = res;
		})
	}
}
</script>
<template>
	<header>
		<RouterLink to="/login">Accedi all'area privata</RouterLink>
	</header>
	<section class="banner">
		<h1>Enrico Editore</h1>
		<h2>Un editore fittizio che ti insegna a fare Reverse Engineering</h2>
	</section>
	<main>
		<h1>I test più popolari</h1>
		<Spinner v-if="popularBooks == null"/>
		<Carousel v-else class="gallery" itemsToShow="auto" :wrapAround="true" :autoplay="5000" :gap="50">
			<Slide v-for="book in popularBooks" class="book" :key="book.id">
				<RouterLink :to="'/books/'+book.id" class="carousel__item">
					<img :src="book.thumbnail" title="thumbnail" class="thumbnail" />
					<div class="title">{{ book.title }}</div>
					<div class="author">di <b>{{ book.author }}</b></div>
				</RouterLink>
			</Slide>
			<template #addons>
				<Navigation />
				<Pagination />
			</template>
		</Carousel>
	</main>
	<footer class="code">
		<a href="https://github.com/Leone25/demo-reverse-engineering">View code of Github</a>
	</footer>
</template>
<style scoped>
.banner {
	position: relative;
	display: flex;
    justify-content: center;
    align-items: center;
	flex-flow: column;
	height: 500px;
    background-image: url(/books.jpg);
	background-repeat: no-repeat;
	background-position: center;
	background-size: cover;
}

.banner > * {
	filter: drop-shadow(0 0 5px #fff);
}

.banner h1 {
	font-size: 64px;
}

main {
	padding-bottom: 100px;
}

main h1 {
	color: #fe640b;
	display: list-item;
	list-style: square inside;
	padding-left: 100px;
	font-size: 48px;
}

.gallery {
	gap: 50px;
	padding: 0 50px;
	overflow: hidden;
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

.code {
	text-align: center;
	padding: 50px;
}
</style>
