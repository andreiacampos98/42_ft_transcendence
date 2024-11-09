function addClassToTopLevelDivs(className) {
    const topLevelDivs = document.body.querySelectorAll(':scope > div');
    topLevelDivs.forEach(div => {
        if (div.id !== 'sidebar') {
            div.classList.toggle(className);
        }
    const main_cont = document.getElementById('main-content');
    main_cont.classList.toggle(className)
    });
}

async function toggleFriendsDrawer(user_id) {

    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('show');
    const button = document.getElementById('toggle-button');
    button.classList.toggle('show');
    addClassToTopLevelDivs('darkened-image');

	let token = localStorage.getItem("access_token");
    if (!sidebar.classList.contains('show'))
        return ;

    const response = await fetch(`/friends/${user_id}`, {
		method: 'GET',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
			"Authorization": localStorage.getItem("access_token") ? `Bearer ${token}` : null,
        }
    });
	const data = await response.json();
	
	if (!response.ok && response.status != 401) {
		localStorage.setItem('access_token', data.access_token);
		console.error(data.message);
		return ;
	}
	else if (!response.ok && response.status == 401) {
		alert("As your session has expired, you will be logged out.");
		history.pushState(null, '', `/`);
		htmx.ajax('GET', `/`, {
			target: '#main'
		});
	} else {
		localStorage.setItem('access_token', data.access_token);
	}
    var friends = data.friends.map((entry) => {
		if (entry.user1_id.id == user_id)
			return entry.user2_id;
		else
			return entry.user1_id;
	});

	sidebar.innerHTML = '';

	friends.forEach((friend) => {
		console.log(friend);

		const friendBlock = document.createElement('div');
		friendBlock.classList.add('friend-block');
		friendBlock.id = 'friend2';
		friendBlock.dataset.status = 'online';
		
		const link = document.createElement('a');
		link.style.display = 'block'; 

		const profilePic = document.createElement('img');
		profilePic.classList.add('profile-pic');
		profilePic.alt = 'Profile'; 

		const uri = friend.picture;
		if (friend.picture.includes('http')) 
			profilePic.src = decodeURIComponent(uri.slice(7))
		else 
			profilePic.src = friend.picture;

		const friendInfo = document.createElement('div');
		friendInfo.classList.add('friend-info');

		const username = document.createElement('h4');
		username.textContent = friend.username;

		const status = document.createElement('span');
		status.classList.add('friend-block1');
		status.setAttribute('data-status', friend.status.toLowerCase());
		status.textContent = friend.status;

		friendBlock.onclick = function() {
			history.pushState(null, '', `/users/${friend.id}`);
			htmx.ajax('GET', `/users/${friend.id}`, {
				target: '#main'
			});
		};

		friendInfo.appendChild(username);
		friendInfo.appendChild(status);
		friendBlock.appendChild(profilePic);
		friendBlock.appendChild(friendInfo);
		link.appendChild(friendBlock);
		sidebar.appendChild(link);


	});
}
    
