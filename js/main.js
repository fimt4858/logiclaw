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
}); 