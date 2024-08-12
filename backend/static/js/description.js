$(document).ready(function() {
    $('#edit-profile-button').click(function() {
        // Get the first description content and place it in the textarea
        var descriptionContent = "$('#descriptions-list').find('li').first().text()";
        $('#description').val(descriptionContent);
        // Hide the description list and show the form
        $('#descriptions-list').hide();
        $('#description-form').show();
        $('#edit-profile-button').hide();
    });

    $('#description').keypress(function(event) {
        // Check if the key pressed is Enter (key code 13)
        console.log('Key pressed: ' + event.key);
        if (event.which == 13) {
            event.preventDefault();
            var description = $('#description').val();

            $.ajax({
                url: '/add',
                type: 'POST',
                data: { description: description },
                success: function(response) {
                    // Update the description list with the new content
                    $('#descriptions-list').html('<li id="description-' + response.id + '">' + response.content + '</li>');
                    // Hide the form and show the updated description list
                    $('#description-form').hide();
                    $('#descriptions-list').show();
                    $('#edit-profile-button').show();
                }
            });
        }
    });
});
