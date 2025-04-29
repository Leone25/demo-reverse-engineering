<script setup>
import Spinner from '@/components/Spinner.vue';
</script>
<script>
export default {
    data() {
        return {
            username: '',
            password: '',
            loading: true,
            error: null,
        }
    },
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
        login() {
            if (this.loading) return;
            this.loading = true;
            this.error = null;
            fetch('/api/session', {
                method: 'post',
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify({username: this.username, password: this.password})
            }).then(async res => {
                if (res.ok) {
                    this.setCookie('EEcookie', await res.text(), 1);
                    this.$router.push({path: '/selector'});
                } else {
                    this.error = await res.text();
                    this.loading = false;
                }
            });
        }
    },
    mounted() {
        fetch('/api/user', {credentials: 'include'}).then(res => {
            if (res.ok) this.$router.push({path: '/selector'});
            this.loading = false;
        })
    }
}
</script>
<template>
    <main>
		<div class="modal">
            <h1>LOGIN</h1>
            <input v-model="username" type="text" placeholder="username" @keypress.enter="$refs.password.focus()"/>
            <input v-model="password" type="password" placeholder="password" ref="password" @keypress.enter="login()"/>
            <div v-if="error" class="error">
                {{ error }}
            </div>
            <button @click="login()">Login</button>
        </div>
	</main>
    <div v-if="loading" class="overlay">
        <Spinner />
    </div>
</template>
<style scoped>
main {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    background-image: url(/login.jpg);
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center;
}

.modal {
    background-color: #fe640b;
    border-radius: 20px;
    padding: 20px;
    display: flex;
    flex-flow: column nowrap;
    align-items: center;
    gap: 20px;
	filter: drop-shadow(0 0 10px #0004);
}

.modal h1 {
    color: #eff1f5;
}

input[type=text], input[type=password] {
    background-color: #dce0e8;
    color: #4c4f69;
    border: none;
    border-radius: 8px;
    width: calc(100% - 16px);
    font-size: 16px;
    padding: 8px;
}

.error {
    color: #eff1f5;
}

button {
    width: 100%;
    border: none;
    border-radius: 8px;
    padding: 8px;
    font-size: 16px;
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