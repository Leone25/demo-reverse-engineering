<script setup>
import { RouterLink } from 'vue-router';
import Spinner from '@/components/Spinner.vue';
import { VuePDF, usePDF } from '@tato30/vue-pdf';
import msgpack from 'msgpack-lite/dist/msgpack.min.js';
import aesjs from 'aes-js';
import md5 from 'md5';
</script>
<script>
export default {
    props: ['id'],
    data() {
        return {
            bookInfo: null,
            pdf: null,
            pageInfo: null,
            page: 1,
            loading: true,
            ro: null,
            width: 100,
            height: 100,
            preloaded: {},
            key: [119,175,202,8,96,196,140,213,111,74,75,190,193,126,120,100],
        }
    },
    async mounted() {
        this.ro = new ResizeObserver(this.onResize);
        this.ro.observe(this.$refs.pdf);
        this.width = this.$refs.pdf.offsetWidth;
        this.height = this.$refs.pdf.offsetHeight;
        fetch(`/api/v4/books/${this.id}/bookData.json`, {credentials: 'include'}).then(res => res.json()).then(res => {
            this.bookInfo = res;
        });
    },
    beforeUnmount() {
        this.ro.unobserve(this.$refs.pdf)
    },
    computed: {
        pages() {
            if (!this.bookInfo) return;
            return this.bookInfo.length;
        },
        pageUrl() {
            if (!this.bookInfo) return;
            return this.bookInfo.pages[this.page - 1];
        },
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
        },
        async decryptPage(url) {
            if (!!this.preloaded[url]) return;
            const encryptedFile = await fetch(`/api/v4/books/${this.id}/${url}`, {credentials: 'include'}).then(res => res.bytes());
            const header = msgpack.decode(encryptedFile.slice(0, 256));
            const iv = encryptedFile.slice(256, 272);
            const encryptedFirstPart = encryptedFile.slice(272, 272 + header.start);
            const secondPart = encryptedFile.slice(272 + header.start);
            const aesCbc = new aesjs.ModeOfOperation.cbc(this.key, iv);
            const firstPart = aesjs.padding.pkcs7.strip(aesCbc.decrypt(encryptedFirstPart));
            const merged = new Uint8Array(firstPart.length + secondPart.length);
            merged.set(firstPart);
            merged.set(secondPart, firstPart.length);
            let objectURL = URL.createObjectURL(new Blob([merged.buffer], {type: 'application/pdf'}));
            this.preloaded[url] = objectURL;
            if (md5(merged) != header.md5) console.log("Warning: MD5 did not match for file " + url);
            // manually trigger pdf update
            this.updatePDF();
        },
        updatePDF() {
            if (!this.pageUrl) return;
            if (!this.preloaded[this.pageUrl]) return this.decryptPage(this.pageUrl);
            this.pdf = usePDF({
                url: this.preloaded[this.pageUrl]
            }).pdf;

            // preload next pages for smoother experience
            let start = this.page - 2;
            let end = this.page + 2;
            if (start < 1) start = 1;
            if (start > this.pages) end = this.pages;
            for (let i = start; i <= end; i++) {
                if (i == this.page) continue;
                this.decryptPage(this.bookInfo.pages[i - 1]);
            }
        }
    },
    watch: {
        pageUrl() {
            this.updatePDF();
        },
    }
}
</script>
<template>
    <header>
		<RouterLink to="/logout">Logout</RouterLink>
	</header>
    <RouterLink to="/v4/library" class="back">&#60; Torna alla libreria</RouterLink>
    <div class="prev" @click="prevPage" v-show="page != 1">&#60;</div>
    <div class="pdf" ref="pdf">
        <VuePDF v-if="pdf" :pdf="pdf" @loaded="onLoaded" :page="1" :height="actualHeight"/>
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