// 카카오맵 초기화
function initMap() {
    const container = document.getElementById('map');
    const options = {
        center: new kakao.maps.LatLng(37.4979, 127.0276), // 강남역 좌표
        level: 3
    };
    
    const map = new kakao.maps.Map(container, options);
    
    // 마커 생성
    const marker = new kakao.maps.Marker({
        position: options.center
    });
    
    marker.setMap(map);
    
    // 인포윈도우 생성
    const infowindow = new kakao.maps.InfoWindow({
        content: '<div style="padding:5px;">법률사무소</div>'
    });
    
    infowindow.open(map, marker);
}

// 페이지 로드 시 카카오맵 초기화
window.onload = function() {
    initMap();
};

// 모바일 메뉴 토글
document.addEventListener('DOMContentLoaded', function() {
    const nav = document.querySelector('nav');
    const logo = document.querySelector('.logo');
    
    logo.addEventListener('click', function() {
        const navLinks = document.querySelector('.nav-links');
        if (window.innerWidth <= 768) {
            navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
        }
    });

    // 홈페이지인지 확인 (body에 home-page 클래스가 있는지)
    const isHomePage = document.body.classList.contains('home-page');
    
    if (isHomePage) {
        const heroSection = document.querySelector('.hero-section');
        const scrollArrow = document.querySelector('.scroll-arrow');
        const header = document.querySelector('header');
        const body = document.body;
        
        // 초기 로드 시 배너가 전체화면으로 표시되었는지 확인
        const isFullscreen = heroSection.classList.contains('fullscreen');
        
        // 스크롤 이벤트 리스너
        window.addEventListener('scroll', function() {
            const scrollPosition = window.scrollY;
            
            // 스크롤이 시작되면 전체화면 모드 해제 및 헤더 표시
            if (scrollPosition > 50 && isFullscreen) {
                heroSection.classList.remove('fullscreen');
                header.classList.remove('header-hidden');
                body.classList.add('scrolled');
                if (scrollArrow) {
                    scrollArrow.style.display = 'none';
                }
            } else if (scrollPosition <= 50 && !heroSection.classList.contains('fullscreen')) {
                // 맨 위로 돌아오면 다시 전체화면 모드로 및 헤더 숨김
                heroSection.classList.add('fullscreen');
                header.classList.add('header-hidden');
                body.classList.remove('scrolled');
                if (scrollArrow) {
                    scrollArrow.style.display = 'block';
                }
            }
        });
        
        // 스크롤 화살표 클릭 이벤트
        if (scrollArrow) {
            scrollArrow.addEventListener('click', function() {
                window.scrollTo({
                    top: window.innerHeight,
                    behavior: 'smooth'
                });
            });
        }
    }
}); 