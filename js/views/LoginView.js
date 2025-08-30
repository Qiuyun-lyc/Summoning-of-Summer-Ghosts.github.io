const LoginView = {
    render: (container, engine) => {
        const L = engine.localization;
        container.innerHTML = `
            <div class="view auth-view" id="login-view">
                <div class="bg" style="background-image: url('./assets/img/bgr/mainmenu.png');"></div>
                <div class="auth-form">
                    <img src="./assets/img/login/paper.png" class="auth-form-img">
                    <div class="auth-form-line">
                        <label class="auth-form-label">${L.get('ui.username')}</label>
                        <input type="text" id="username" name="username">
                    </div>
                    <div class="auth-form-line">
                        <label class="auth-form-label">${L.get('ui.password')}</label>
                        <input type="password" id="password" name="password">
                    </div>
                </div>
                <div class="auth-button-group">
                    <div class="auth-button" id="login-btn">
                        <img src="./assets/img/login/button.png">
                        <h5>${L.get('ui.login')}</h5>
                    </div>
                    <div class="auth-button" id="register-nav-btn">
                        <img src="./assets/img/login/button.png">
                        <h5>${L.get('ui.register')}</h5>
                    </div>
                </div>
            </div>
        `;
    },
    attachEventListeners: (container, engine) => {
        document.getElementById('login-btn').addEventListener('click', () => {
            const user = document.getElementById('username').value;
            const pass = document.getElementById('password').value;
            if (engine.saveManager.login(user, pass)) {
                engine.showView('MainMenu');
            } else {
                alert('登录失败，请检查用户名和密码。');
            }
        });

        document.getElementById('register-nav-btn').addEventListener('click', () => {
            engine.showView('Register');
        });
    }
};

export default LoginView;