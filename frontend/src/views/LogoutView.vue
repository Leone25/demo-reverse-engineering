<script setup>
import Spinner from '@/components/Spinner.vue';
</script>
<script>
export default {
    methods: {
        setCookie(name,value,days) {
            var expires = "";
            if (days) {
                var date = new Date();
                date.setTime(date.getTime() + (days*24*60*60*1000));
                expires = "; expires=" + date.toUTCString();
            }
            document.cookie = name + "=" + (value || "")  + expires + "; path=/";
        },
    },
    mounted() {
        fetch('/api/session', {method: 'delete', credentials: 'include'}).then(() => {
            this.setCookie('EEcookie', '', -1);
            this.$router.push({path: '/'});
        });
    }
}
</script>
<template>
    <main>
        <Spinner />
    </main>
</template>
<style scoped>
main {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    background-image: url(/login.jpg);
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center;
}
</style>