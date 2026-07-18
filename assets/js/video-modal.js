(function () {
	var modal = document.getElementById('video-modal');
	if (!modal)
		return;

	var frame = modal.querySelector('.video-modal__frame');
	var closeButton = modal.querySelector('.video-modal__close');
	var fallback = modal.querySelector('.video-modal__fallback');
	var fallbackLink = modal.querySelector('.video-modal__fallback-link');
	var emptySrc = '';

	function cleanVideoId(value) {
		return (value || '').split('?')[0].split('&')[0].split('#')[0].split('/')[0].replace(/\//g, '');
	}

	function toEmbedUrl(url) {
		if (!url)
			return '';

		try {
			var parsed = new URL(url);
			var host = parsed.hostname.replace(/^www\./, '');

			if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com' || host === 'youtu.be' || host === 'youtube-nocookie.com') {
				var videoId = '';

				if (host === 'youtu.be')
					videoId = cleanVideoId(parsed.pathname.replace(/^\//, ''));
				else if (parsed.pathname === '/watch')
					videoId = cleanVideoId(parsed.searchParams.get('v'));
				else if (parsed.pathname.indexOf('/embed/') === 0)
					videoId = cleanVideoId(parsed.pathname.split('/embed/')[1]);
				else if (parsed.pathname.indexOf('/shorts/') === 0)
					videoId = cleanVideoId(parsed.pathname.split('/shorts/')[1]);
				else if (parsed.pathname.indexOf('/live/') === 0)
					videoId = cleanVideoId(parsed.pathname.split('/live/')[1]);
				else if (parsed.pathname.indexOf('/v/') === 0)
					videoId = cleanVideoId(parsed.pathname.split('/v/')[1]);

				if (videoId) {
					var origin = window.location.origin && window.location.origin.indexOf('http') === 0 ? '&origin=' + encodeURIComponent(window.location.origin) : '';
					return 'https://www.youtube.com/embed/' + videoId + '?autoplay=1&rel=0&playsinline=1' + origin;
				}
			}

			if (host === 'vimeo.com' || host === 'player.vimeo.com') {
				var match = parsed.pathname.match(/(\d+)/);
				if (match)
					return 'https://player.vimeo.com/video/' + match[1] + '?autoplay=1';
			}

			if (host === 'tiktok.com' || host === 'vm.tiktok.com' || host === 'vt.tiktok.com') {
				var tiktokVideo = parsed.pathname.match(/\/video\/(\d+)/);
				if (tiktokVideo)
					return 'https://www.tiktok.com/embed/v2/' + tiktokVideo[1];
			}
		} catch (error) {
			return '';
		}

		return '';
	}

	function showModal() {
		modal.classList.add('is-visible');
		modal.setAttribute('aria-hidden', 'false');
		document.body.classList.add('is-video-modal-visible');
	}

	function showFallback(url) {
		frame.src = emptySrc;
		frame.style.display = 'none';

		if (fallback && fallbackLink) {
			fallbackLink.href = url;
			fallback.style.display = 'flex';
			fallback.setAttribute('aria-hidden', 'false');
		}

		showModal();
	}

	function openModal(url, externalOnly) {
		if (externalOnly) {
			showFallback(url);
			return;
		}

		var embedUrl = toEmbedUrl(url);
		if (!embedUrl) {
			if (url && url !== '#')
				window.open(url, '_blank', 'noopener');

			return;
		}

		if (fallback) {
			fallback.style.display = 'none';
			fallback.setAttribute('aria-hidden', 'true');
		}

		frame.style.display = 'block';
		frame.src = embedUrl;
		showModal();
	}

	function closeModal() {
		frame.src = emptySrc;
		frame.style.display = 'block';
		if (fallback) {
			fallback.style.display = 'none';
			fallback.setAttribute('aria-hidden', 'true');
		}
		modal.classList.remove('is-visible');
		modal.setAttribute('aria-hidden', 'true');
		document.body.classList.remove('is-video-modal-visible');
	}

	function getVideoUrl(trigger) {
		var directUrl = trigger.getAttribute('href');
		if (directUrl && directUrl !== '#')
			return directUrl;

		return '';
	}

	document.addEventListener('click', function (event) {
		var article = event.target.closest('#one.tiles article');
		if (!article)
			return;

		var trigger = event.target.closest('.video-trigger');
		var firstButton = article.querySelector('.video-links .video-trigger');
		var url = trigger ? getVideoUrl(trigger) : (firstButton ? getVideoUrl(firstButton) : '');
		var externalOnly = trigger ? trigger.getAttribute('data-external-only') === 'true' : (firstButton ? firstButton.getAttribute('data-external-only') === 'true' : false);

		event.preventDefault();
		event.stopPropagation();

		if (typeof event.stopImmediatePropagation === 'function')
			event.stopImmediatePropagation();

		openModal(url || '', externalOnly);
	}, true);

	closeButton.addEventListener('click', closeModal);

	modal.addEventListener('click', function (event) {
		if (event.target === modal)
			closeModal();
	});

	document.addEventListener('keydown', function (event) {
		if (event.key === 'Escape' && modal.classList.contains('is-visible'))
			closeModal();
	});
})();
