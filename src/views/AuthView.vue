<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import axios from "axios";

const route = useRoute()
const router = useRouter()

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

if (!urlParams.has('code')) {
    router.push('/login')
}

console.log(route.path)
if (route.path === '/auth/register') {

} else {
    axios.get(`http://ec2co-ecsel-7i88sw5ak5o0-1780126779.us-west-2.elb.amazonaws.com/register?code=${urlParams.get('code')}`)
}
</script>

<template>

</template>

<style scoped>

</style>
