import axios from "axios";
import {defineStore} from "pinia";

export const useUserStore = defineStore('user', {
    state: () => {
        return {
            username: 'CharlieFox',
            isLoggedIn: false
        }
    },

    actions: {
        async loginUser():Promise<void> {
            try {
                console.log('Login in...')
                const response = await axios.get('http://ec2co-ecsel-7i88sw5ak5o0-1780126779.us-west-2.elb.amazonaws.com/auth?location=http://127.0.0.1:5173/')

                console.log('Response :')
                console.log(response)
            } catch (error) {
                console.error(error)
            }
        }
    }
})