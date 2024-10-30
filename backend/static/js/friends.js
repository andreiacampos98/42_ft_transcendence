// document.addEventListener('DOMContentLoaded', () => {
//     const observer = new MutationObserver((mutations) => {
//         mutations.forEach((mutation) => {
//           mutation.addedNodes.forEach((node) => {
//             if (node.nodeType === 1 && !node["htmx-internal-data"]) {
//               htmx.process(node)
//             }
//           })
//         })
//       });
//     observer.observe(document, {childList: true, subtree: true});
// })

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

async function toggleFriendsDrawer(user_id) {

    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('show');
    const button = document.getElementById('toggle-button');
    button.classList.toggle('show');
    addClassToTopLevelDivs('darkened-image');

    if (!sidebar.classList.contains('show'))
        return ;

    const response = await fetch(`/friends/${user_id}`, {
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    });
	const data = await response.json();

    var friends = data.map((entry) => {
		if (entry.user1_id.id == user_id)
			return entry.user2_id;
		else
			return entry.user1_id;
	});

	sidebar.innerHTML = '';  // Clear existing content

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
    
