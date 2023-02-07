interface Jwt {
    exp: number;
}

export function getJwtFromAccessToken(accessToken: string): Jwt {
    const accessTokenUrl = accessToken.split(".")[1];
    const b64accessTokenUrl = accessTokenUrl.replace(/-/g, "+").replace(/_/g, "/");

    const decodedAccessTokenUrl = window
        .atob(b64accessTokenUrl)
        .split("")
        .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("");

    const jsonPayload: Jwt = JSON.parse(decodeURIComponent(decodedAccessTokenUrl));

    return jsonPayload;
}
