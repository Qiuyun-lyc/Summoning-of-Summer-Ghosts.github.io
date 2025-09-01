const LoginView = {
    render: (container, engine) => {
        const L = engine.localization;
        container.innerHTML = `
            <div class="view auth-view" id="login-view">
                <div class="bg" style="background-image: url('./assets/img/bgr/mainmenu.png');"></div>
                
                <!-- 整个登录区域容器（纸 + 按钮组） -->
                <div class="auth-container" style="display:flex; flex-direction:column; align-items:center; justify-content:center;">

                    <!-- 纸 + 输入框 -->
                    <div class="auth-form" style="position:relative; text-align:center;">
                        <img src="./assets/img/login/paper.png" class="auth-form-img" style="display:block; margin:0 auto;">

                        <!-- 用户名 -->
                        <div class="auth-form-line" style="text-align:left; width:80%; margin:10px auto;">
                            <label class="auth-form-label" style="font-size:22px; display:block; margin-bottom:5px; color:#3b2c1a; font-weight:bold; font-family:serif;">
                                ${L.get('ui.username')}
                            </label>
                            <input type="text" id="username" name="username" 
                                style="width:100%; font-size:18px; padding:8px 10px; 
                                border:2px solid #b89b72; border-radius:8px;
                                background-color:rgba(245,235,215,0.9); 
                                color:#2c1b10; font-family:serif; box-shadow:inset 2px 2px 4px rgba(0,0,0,0.1);">
                        </div>

                        <!-- 密码 -->
                        <div class="auth-form-line" style="text-align:left; width:80%; margin:10px auto;">
                            <label class="auth-form-label" style="font-size:22px; display:block; margin-bottom:5px; color:#3b2c1a; font-weight:bold; font-family:serif;">
                                ${L.get('ui.password')}
                            </label>
                            <input type="password" id="password" name="password" 
                                style="width:100%; font-size:18px; padding:8px 10px; 
                                border:2px solid #b89b72; border-radius:8px;
                                background-color:rgba(245,235,215,0.9); 
                                color:#2c1b10; font-family:serif; box-shadow:inset 2px 2px 4px rgba(0,0,0,0.1);">
                        </div>
                    </div>

                    <!-- 登录 / 注册按钮组（紧跟在纸的下面） -->
                    <div class="auth-button-group" 
                         style="display:flex; justify-content:space-evenly; align-items:center; width:100%; max-width:500px; margin-top:20px;">
                        
                        <div class="auth-button" id="login-btn" style="position:relative; cursor:pointer; text-align:center;">
                            <img src="./assets/img/login/button.png" style="width:120px;">
                            <h5 style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); margin:0; color:white; font-size:18px; font-family:serif;">
                                ${L.get('ui.login')}
                            </h5>
                        </div>

                        <div class="auth-button" id="register-nav-btn" style="position:relative; cursor:pointer; text-align:center;">
                            <img src="./assets/img/login/button.png" style="width:120px;">
                            <h5 style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); margin:0; color:white; font-size:18px; font-family:serif;">
                                ${L.get('ui.register')}
                            </h5>
                        </div>
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
