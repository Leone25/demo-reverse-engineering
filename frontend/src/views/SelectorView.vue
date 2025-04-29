<script setup>
import { RouterLink } from 'vue-router';
</script>
<template>
    <header>
		<RouterLink to="/logout">Logout</RouterLink>
	</header>
	<main class="container">
        <div class="modal">
            <h1>Seleziona la versione del reader che desideri usare</h1>
            <div class="versions">
                <RouterLink to="/v1/library" class="option">V1</RouterLink>
                <RouterLink to="/v2/library" class="option">V2</RouterLink>
                <RouterLink to="/v3/library" class="option">V3</RouterLink>
                <RouterLink to="/v4/library" class="option">V4</RouterLink>
            </div>
        </div>
	</main>
</template>
<style scoped>
main {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
}

.modal {
    display: flex;
    flex-flow: column nowrap;
    justify-content: center;
    padding-bottom: 150px;
}

main h1 {
	color: #fe640b;
	display: list-item;
	list-style: square inside;
	padding-left: 100px;
	font-size: 32px;
}

.versions {
    display: flex;
    gap: 20px;
    flex-flow: row nowrap;
    justify-content: center;
}

.option {
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    width: 100px;
    height: 100px;
    font-size: 24px;
    background-color: #fe640b;
    border-radius: 5px;
    color: white;
}
</style>