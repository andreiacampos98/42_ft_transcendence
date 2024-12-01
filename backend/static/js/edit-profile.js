function onEditButtonClick() {
	document.getElementById("save-cancel").style.display = "flex";
	document.getElementById("edit-change1").style.display = "none";
    document.getElementById("username-stat").style.display = "none";
    document.getElementById("button-inside").style.display = "inherit";
    document.getElementById("online-stat").style.display = "none !important";
	document.getElementById("edit-change1").classList.remove("d-flex");
    document.getElementById("edit-profile-button").style.display = "none";
    document.getElementById("save-profile-button").style.display = "inline-block";
    document.getElementById("cancel-edit-button").style.display = "inline-block";
    document.getElementById("edit-profile-form").style.display = "block";
    document.getElementById("change-info2").style.display = "none";
    const changePasswordModal = document.getElementById("open-change-password-modal");
    if (changePasswordModal) {
        changePasswordModal.style.display = "none";
    }

    document.getElementById('profile-picture-input').addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();

            reader.onload = function(e) {
                document.getElementById('profile-picture-preview').src = e.target.result;
            }
            reader.readAsDataURL(file);
        } 
    });
}

function onCancelButtonClick(userId) {
	document.getElementById("edit-change1").style.display = "flex";
    document.getElementById("username-stat").style.display = "inherit";
    document.getElementById("online-stat").style.display = "inherit";
	document.getElementById("save-cancel").style.display = "none";
	document.getElementById("button-inside").style.display = "none";
	document.getElementById("save-cancel").classList.remove("d-flex");
    document.getElementById("edit-profile-button").style.display = "flex";
    document.getElementById("save-profile-button").style.display = "none";
    document.getElementById("cancel-edit-button").style.display = "none";
    document.getElementById("edit-profile-form").style.display = "none";
    document.getElementById("change-info1").style.display = "block";
    document.getElementById("change-info2").style.display = "block";
    const changePasswordModal = document.getElementById("open-change-password-modal");
    if (changePasswordModal) {
        changePasswordModal.style.display = "none";
    }
    history.replaceState(null, '', `/users/${userId}`);
    htmx.ajax('GET', `/users/${userId}`, {
        target: '#main'  
    }).then(() => appendScripts());
}

async function onSaveButtonClick(event, userId) {
    event.preventDefault(); 
    const formData = new FormData(document.getElementById("edit-profile-form"));
    let token = localStorage.getItem("access_token");
	console.log(document.getElementById("edit-profile-form"));

    const response = await fetch(`/users/${userId}/update`, {
        method: "POST",
        body: formData,
        headers: {
            "Authorization": localStorage.getItem("access_token") ? `Bearer ${token}` : null,
        }
    });
	const data = await response.json();

	if (response.status != 201 && response.status != 401){
        localStorage.setItem('access_token', data.access_token);
		alert(data.message);
    }
    else if (response.status == 401) {
		alert("As your session has expired, you will be logged out.");
		history.pushState(null, '', `/`);
		htmx.ajax('GET', `/`, {
			target: '#main'
		});
	}
	else {
        localStorage.setItem('access_token', data.access_token);
		history.replaceState(null, '', `/users/${userId}`);
		htmx.ajax('GET', `/users/${userId}`, {
			target: '#main'  
		}).then(() => appendScripts());
	}
}

function triggerFileInput() {
    // Programmatically click the hidden input
    document.getElementById('profile-picture-input').click();
}