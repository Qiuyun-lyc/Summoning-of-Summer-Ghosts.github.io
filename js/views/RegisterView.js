const RegisterView = {
    render: (container, engine) => {
        const L = engine.localization;
        container.innerHTML = `
            <div class="view auth-view" id="register-view">
                <div class="bg" style="background-image: url('./assets/img/bgr/mainmenu.png');"></div>
                <div class="auth-form">
                    <img src="./assets/img/menuBox/paper.png" class="auth-form-img">
                    <div class="auth-form-line">
                        <label class="auth-form-label">${L.get('ui.username')}</label>
                        <input type="text" id="username" name="username">
                    </div>
                    <div class="auth-form-line">
                        <label class="auth-form-label">${L.get('ui.password')}</label>
                        <input type="password" id="password" name="password">
                    </div>
                     <div class="auth-form-line">
                        <label class="auth-form-label">${L.get('ui.confirm')}</label>
                        <input type="password" id="password2" name="password2">
                    </div>
                </div>
                <div class="auth-button-group">
                    <div class="auth-button" id="register-btn">
                        <img src="./assets/img/login/button.png">
                        <h5>${L.get('ui.register')}</h5>
                    </div>
                    <div class="auth-button" id="back-to-login-btn">
                        <img src="./assets/img/login/button.png">
                        <h5>${L.get('ui.back')}</h5>
                    </div>
                </div>
            </div>
        `;
    },
    attachEventListeners: (container, engine) => {
        document.getElementById('register-btn').addEventListener('click', () => {
            const user = document.getElementById('username').value;
            const pass1 = document.getElementById('password').value;
            const pass2 = document.getElementById('password2').value;
            if (!user || !pass1) {
                alert("用户名和密码不能为空。");
                return;
            }
            if (pass1 !== pass2) {
                alert("两次输入的密码不一致。");
                return;
            }
            if (engine.saveManager.register(user, pass1)) {
                alert('注册成功！');
                engine.showView('Login');
            } else {
                alert('注册失败，用户名已存在。');
            }
        });

        document.getElementById('back-to-login-btn').addEventListener('click', () => {
            engine.showView('Login');
        });
    }
};
export default RegisterView;