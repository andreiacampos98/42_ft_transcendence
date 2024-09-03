function addClassToTopLevelDivs(className) {
    // Select all div elements that are direct children of the body
    const topLevelDivs = document.body.querySelectorAll(':scope > div');
    topLevelDivs.forEach(div => {
        if (div.id !== 'sidebar') {
            div.classList.toggle(className);
        }
    const main_cont = document.getElementById('main-content');
    main_cont.classList.toggle(className)
    });
}

function toggleSidebar(user_id) {

    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('show');
    const button = document.getElementById('toggle-button');
    button.classList.toggle('show');
    addClassToTopLevelDivs('darkened-image');

    if (!sidebar.classList.contains('show'))
        return ;

    fetch(`/friends/${user_id}`, {
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => response.json())
    .then(entries => {
        var friends = entries.map((entry) => {
            if (entry.user1_id.id == user_id)
                return entry.user2_id
            else
                return entry.user1_id
        });

        const sidebar = document.getElementById('sidebar');
        sidebar.innerHTML = '';  // Clear existing content

        friends.forEach(friend => {
            console.log(friend);

            const friendBlock = document.createElement('div');
            friendBlock.classList.add('friend-block');
            friendBlock.id = 'friend2';
            friendBlock.dataset.status = 'online';
            
            const link = document.createElement('a');
            link.classList.add('a-links');
            link.href = `/users/${friend.username}`;
            link.setAttribute('hx-get', `/users/${friend.username}`);
            link.setAttribute('hx-target', '#MainPage'); // Assume que você tem uma div com id "main-content"
            link.setAttribute('hx-swap', 'outerHTML');
            link.setAttribute('hx-trigger', 'click');
            link.style.display = 'block'; 

            const profilePic = document.createElement('img');
            profilePic.classList.add('profile-pic');
            profilePic.src = friend.picture;
            profilePic.alt = 'Profile'; 

            const friendInfo = document.createElement('div');
            friendInfo.classList.add('friend-info');

            const username = document.createElement('h4');
            username.textContent = friend.username;

            const status = document.createElement('span');
            status.classList.add('friend-block1');
            status.setAttribute('data-status', friend.status.toLowerCase());
            status.textContent = friend.status;

            friendInfo.appendChild(username);
            friendInfo.appendChild(status);
            friendBlock.appendChild(profilePic);
            friendBlock.appendChild(friendInfo);
            link.appendChild(friendBlock);
            sidebar.appendChild(link);

        });
    });
}

    
