<script>
export default {
    //
}
</script>
<template>
    <div class="loading">
        <div class="spinner"></div>
    </div>
</template>
<style scoped>
.loading {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}
  
.spinner {
    content: '';
    height: 80px;
    width: 80px;
    border-radius: 80px;
    border: solid 15px;
    border-color: white transparent;
    animation-name: rotate;
    animation-iteration-count: infinite;
    animation-duration: 1s;
}

@keyframes rotate {
    from {transform: rotate(0deg) scale(1); border-color: white transparent;}
    50% {transform: rotate(180deg) scale(0.9); border-color: #fe640b transparent;}
    to {transform: rotate(360deg); border-color: white transparent;}
}
</style>