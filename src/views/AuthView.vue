<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import {useUserStore} from "@/stores/userStore";

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

await router.isReady()

if (!urlParams.has('code')) {
    router.push('/login')
}

let response

if (route.path === '/auth/register') {
    try {
        response = await axios.get(`http://ec2co-ecsel-7i88sw5ak5o0-1780126779.us-west-2.elb.amazonaws.com/auth/register?code=${urlParams.get('code')}&redirectUri=http://localhost:5173/auth/register`)

        userStore.accessToken = response.data.accessToken
        localStorage.setItem('refreshToken', response.data.refreshToken);
        router.push('/login/link')
    } catch (e) {
        console.log('Error while registering in')
        router.push('/login')
    }

} else {
    try {
        response = await axios.get(`http://ec2co-ecsel-7i88sw5ak5o0-1780126779.us-west-2.elb.amazonaws.com/auth/signin?code=${urlParams.get('code')}&redirectUri=http://localhost:5173/auth`)

        userStore.accessToken = response.data.accessToken
        localStorage.setItem('refreshToken', response.data.refreshToken);
        router.push('/')
    } catch (e) {
        console.log('Error while logging in')
        router.push('/login')
    }
}
</script>

<template>

</template>

<style scoped>

</style>
