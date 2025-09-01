const RegisterView = {
    render: (container, engine) => {
        const L = engine.localization;
        container.innerHTML = `
            <div class="view auth-view" id="register-view">
                <div class="bg" style="background-image: url('./assets/img/bgr/mainmenu.png');"></div>
                
                <!-- 表单区域 -->
                <div class="auth-form" style="position:relative; text-align:center;">
                    <img src="./assets/img/menuBox/paper.png" class="auth-form-img" style="display:block; margin:0 auto;">
                    
                    <!-- 用户名 -->
                    <div class="auth-form-line" style="text-align:left; width:80%; margin:10px auto;">
                        <label class="auth-form-label" 
                               style="font-size:22px; display:block; margin-bottom:5px; color:#3b2c1a; font-weight:bold; font-family:serif;">
                               ${L.get('ui.username')}
                        </label>
                        <input type="text" id="username" name="username"
                            style="width:100%; font-size:18px; padding:8px 10px;
                            border:2px solid #b89b72; border-radius:8px;
                            background-color:rgba(245,235,215,0.9);
                            color:#2c1b10; font-family:serif;
                            box-shadow:inset 2px 2px 4px rgba(0,0,0,0.1);">
                    </div>

                    <!-- 密码 -->
                    <div class="auth-form-line" style="text-align:left; width:80%; margin:10px auto;">
                        <label class="auth-form-label" 
                               style="font-size:22px; display:block; margin-bottom:5px; color:#3b2c1a; font-weight:bold; font-family:serif;">
                               ${L.get('ui.password')}
                        </label>
                        <input type="password" id="password" name="password"
                            style="width:100%; font-size:18px; padding:8px 10px;
                            border:2px solid #b89b72; border-radius:8px;
                            background-color:rgba(245,235,215,0.9);
                            color:#2c1b10; font-family:serif;
                            box-shadow:inset 2px 2px 4px rgba(0,0,0,0.1);">
                    </div>

                    <!-- 确认密码 -->
                    <div class="auth-form-line" style="text-align:left; width:80%; margin:10px auto;">
                        <label class="auth-form-label" 
                               style="font-size:22px; display:block; margin-bottom:5px; color:#3b2c1a; font-weight:bold; font-family:serif;">
                               ${L.get('ui.confirm')}
                        </label>
                        <input type="password" id="password2" name="password2"
                            style="width:100%; font-size:18px; padding:8px 10px;
                            border:2px solid #b89b72; border-radius:8px;
                            background-color:rgba(245,235,215,0.9);
                            color:#2c1b10; font-family:serif;
                            box-shadow:inset 2px 2px 4px rgba(0,0,0,0.1);">
                    </div>
                </div>

                <!-- 按钮组 -->
                <div class="auth-button-group" 
                     style="display:flex; justify-content:space-evenly; align-items:center; width:100%; max-width:500px; margin-top:20px;">
                    
                    <div class="auth-button" id="register-btn" style="position:relative; cursor:pointer; text-align:center;">
                        <img src="./assets/img/login/button.png" style="width:120px;">
                        <h5 style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%);
                                   margin:0; color:white; font-size:18px; font-family:serif;">
                            ${L.get('ui.register')}
                        </h5>
                    </div>

                    <div class="auth-button" id="back-to-login-btn" style="position:relative; cursor:pointer; text-align:center;">
                        <img src="./assets/img/login/button.png" style="width:120px;">
                        <h5 style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%);
                                   margin:0; color:white; font-size:18px; font-family:serif;">
                            ${L.get('ui.back')}
                        </h5>
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
