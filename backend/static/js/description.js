function onEditButtonClick() {
    document.getElementById("edit-profile-button").style.display = "none";
    document.getElementById("save-profile-button").style.display = "inline-block";
    document.getElementById("cancel-edit-button").style.display = "inline-block";
    document.getElementById("edit-profile-form").style.display = "block";
    document.getElementById("change-info1").style.display = "none";
    document.getElementById("change-info2").style.display = "none";
    document.getElementById("change-password").style.display = "none";

    document.getElementById('profile-picture-preview').style.display = 'block';
    document.getElementById('profile-picture-input').addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();

            reader.onload = function(e) {
                // Define o src da imagem de pré-visualização
                document.getElementById('profile-picture-preview').src = e.target.result;
            }

            // Lê o arquivo como uma URL de dados
            reader.readAsDataURL(file);
        } 
    });
}

function onCancelButtonClick() {
    document.getElementById("edit-profile-button").style.display = "inline-block";
    document.getElementById("save-profile-button").style.display = "none";
    document.getElementById("cancel-edit-button").style.display = "none";
    document.getElementById("edit-profile-form").style.display = "none";
    document.getElementById("change-info1").style.display = "block";
    document.getElementById("change-info2").style.display = "block";
    document.getElementById("change-password").style.display = "block";
}

function onSaveButtonClick(event, userId) {
    event.preventDefault(); 
    const formData = new FormData(document.getElementById("edit-profile-form"));

    fetch(`users/${userId}/update`, {
        method: "POST",
        body: formData,
        headers: {
            "X-CSRFToken": document.querySelector('[name=csrfmiddlewaretoken]').value
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
        } else {
            location.reload(); // Atualiza a página para refletir as alterações
        }
    })
    .catch(error => console.error('Error:', error));
}


