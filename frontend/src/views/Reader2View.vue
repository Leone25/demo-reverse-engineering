<script setup>
import { RouterLink } from 'vue-router';
import Spinner from '@/components/Spinner.vue';
import { VuePDF, usePDF } from '@tato30/vue-pdf';
</script>
<script>
export default {
    props: ['id'],
    data() {
        let pdf = usePDF({
            url: '/api/v1/books/' + this.id + '.pdf',
            withCredentials: true,
            disableRange: true,
        });
        return {
            pdf: pdf.pdf,
            pages: pdf.pages,
            pageInfo: null,
            page: 1,
            loading: true,
            ro: null,
            width: 100,
            height: 100,
        }
    },
    mounted() {
        this.ro = new ResizeObserver(this.onResize);
        this.ro.observe(this.$refs.pdf);
        this.width = this.$refs.pdf.offsetWidth;
        this.height = this.$refs.pdf.offsetHeight;
    },
    beforeUnmount() {
        this.ro.unobserve(this.$refs.pdf)
    },
    computed: {
        actualHeight() {
            if (!this.pageInfo) return 300;

            let calculatedWidth = this.height / this.pageInfo.height * this.pageInfo.width;

            if (calculatedWidth > this.width) {
                return this.width / this.pageInfo.width * this.pageInfo.height;
            }

            return this.height;
        }
    },
    methods: {
        onResize() {
            this.width = this.$refs.pdf.offsetWidth;
            this.height = this.$refs.pdf.offsetHeight;
        },
        onLoaded(pageInfo) {
            this.loading = false;
            this.pageInfo = pageInfo;
        },
        nextPage() {
            this.page++;
            if (this.page > this.pages) this.page = this.pages;
        },
        prevPage() {
            this.page--;
            if (this.page < 0) this.page = 0;
        }
    },
}
</script>
<template>
    <header>
		<RouterLink to="/logout">Logout</RouterLink>
	</header>
    <RouterLink to="/v2/library" class="back">&#60; Torna alla libreria</RouterLink>
    <div class="prev" @click="prevPage" v-show="page != 1">&#60;</div>
    <div class="pdf" ref="pdf">
        <VuePDF :pdf="pdf" @loaded="onLoaded" :page="page" :height="actualHeight"/>
    </div>
    <div class="next" @click="nextPage" v-show="page != pages">&#62;</div>
    <div v-if="loading" class="overlay">
        <Spinner />
    </div>
</template>
<style scoped>

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

.pdf {
    height: calc(100% - 64px);
    display: flex;
    justify-content: center;
    align-items: center;
}

.prev, .next {
    position: absolute;
    top: 65px;
    width: 100px;
    font-weight: bold;
    font-size: 4rem;
    height: calc(100% - 64px);
    background: #9ca0b099;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100;
    user-select: none;
}

.prev {
    left: 0;
}

.next {
    right: 0;
}

.back {
    position: absolute;
    top: 128px;
    left: 192px;
    z-index: 101;
}
</style>