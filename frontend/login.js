
    const firebaseConfig = {
      apiKey: "AIzaSyBjJaPQ2Zon1QduWhVpp5dadChkryPojPU",
      authDomain: "jai-s-art-gallery-161b0.firebaseapp.com",
      projectId: "jai-s-art-gallery-161b0",
      storageBucket: "jai-s-art-gallery-161b0.appspot.com",
      messagingSenderId: "13314684388",
      appId: "1:13314684388:web:e0917b8f772033fc2403f1",
      measurementId: "G-9ZEHZ5R7N4"
    };
    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();

    function switchTab(tab) {
      document.getElementById("loginTab").classList.remove("active");
      document.getElementById("signupTab").classList.remove("active");
      document.getElementById("loginForm").classList.remove("active");
      document.getElementById("signupForm").classList.remove("active");
      if (tab === "login") {
        document.getElementById("loginTab").classList.add("active");
        document.getElementById("loginForm").classList.add("active");
      } else {
        document.getElementById("signupTab").classList.add("active");
        document.getElementById("signupForm").classList.add("active");
      }
    }
    function togglePassword(inputId, toggleElement) {
      const input = document.getElementById(inputId);
      const icon = toggleElement.querySelector('i');
      if (input.type === 'password') {
        input.type = 'text';
        icon.classList.replace('fa-eye','fa-eye-slash');
      } else {
        input.type = 'password';
        icon.classList.replace('fa-eye-slash','fa-eye');
      }
    }
    function showToast(msg, type='success') {
      const toast=document.getElementById('toast');
      const icon=document.getElementById('toastIcon');
      const text=document.getElementById('toastMessage');
      toast.className=`toast ${type} show`;
      icon.className= type==='success' ? 'fas fa-check-circle':'fas fa-exclamation-circle';
      text.textContent=msg;
      setTimeout(()=>toast.classList.remove('show'),3000);
    }
    function handleLogin(e) {
      e.preventDefault();
      const email=document.getElementById('loginEmail').value;
      const password=document.getElementById('loginPassword').value;
      const spinner=document.getElementById('loginSpinner');
      const text=document.getElementById('loginText');
      spinner.style.display='inline-block'; text.textContent='Logging in...';
      auth.signInWithEmailAndPassword(email,password)
        .then(()=>{ spinner.style.display='none'; text.textContent='Login';
          showToast('Login successful!'); setTimeout(()=>location.href='main.html',1500);
        })
        .catch(err=>{ spinner.style.display='none'; text.textContent='Login'; showToast(err.message,'error'); });
    }
    function handleSignup(e) {
      e.preventDefault();
      const fullName=document.getElementById('fullName').value;
      const email=document.getElementById('email').value;
      const pass=document.getElementById('password').value;
      const confirm=document.getElementById('confirmPassword').value;
      const spinner=document.getElementById('signupSpinner');
      const text=document.getElementById('signupText');
      if(pass!==confirm) return showToast('Passwords do not match','error');
      spinner.style.display='inline-block'; text.textContent='Creating...';
      auth.createUserWithEmailAndPassword(email,pass)
        .then(cred=>{ spinner.style.display='none'; text.textContent='Sign Up';
          cred.user.updateProfile({displayName:fullName});
          showToast('Account created!'); switchTab('login');
        })
        .catch(err=>{ spinner.style.display='none'; text.textContent='Sign Up'; showToast(err.message,'error'); });
    }
    function socialLogin(provider) {
      let prov;
      if(provider==='google') prov=new firebase.auth.GoogleAuthProvider();
      if(provider==='facebook') prov=new firebase.auth.FacebookAuthProvider();
      auth.signInWithPopup(prov)
        .then(()=>{ showToast(`Logged in with ${provider}`); setTimeout(()=>location.href='main.html',1500); })
        .catch(err=>showToast(err.message,'error'));
    }
    function showForgotPassword() {
      const email=prompt('Enter your email:');
      if(!email) return;
      auth.sendPasswordResetEmail(email)
        .then(()=>showToast('Password reset email sent!'))
        .catch(err=>showToast(err.message,'error'));
    }
