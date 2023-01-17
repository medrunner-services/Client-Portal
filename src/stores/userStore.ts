import axios from "axios";
import {defineStore} from "pinia";

export const useUserStore = defineStore('user', {
    state: () => {
        return {
            username: String,
            isLoggedIn: false,
            accessToken: String
        }
    },

    actions: {
        loginUser():void {
            window.location.replace('https://discord.com/oauth2/authorize?client_id=1050206397972873227&scope=identify&response_type=code&redirect_uri=http://localhost:5173/auth')
        },

        registerUser():void {
            window.location.replace('https://discord.com/oauth2/authorize?client_id=1050206397972873227&scope=identify&response_type=code&redirect_uri=http://localhost:5173/auth/register')
        },

        async getUser(): Promise<void> {
            try {
                const response = await axios.get('http://ec2co-ecsel-7i88sw5ak5o0-1780126779.us-west-2.elb.amazonaws.com/client/', {headers: {'Authorization': `Bearer ${this.accessToken}`}})

                this.username = response.data.rsiHandle
                this.isLoggedIn = true
            }
            catch (error) {
                if (localStorage.getItem('refreshToken')) {
                    try {
                        const response = await axios.post('http://ec2co-ecsel-7i88sw5ak5o0-1780126779.us-west-2.elb.amazonaws.com/auth/exchange', {refreshToken: localStorage.getItem('refreshToken')})

                        this.accessToken = response.data.accessToken
                        localStorage.setItem('refreshToken', response.data.refreshToken);
                        this.router.push('/')
                    } catch (e) {
                        this.router.push('/login')
                    }
                } else {
                    this.router.push('/login')
                }
            }
        }
    }
})