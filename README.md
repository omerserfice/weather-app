# Zamanlanmış Hava Durumu API Çekici ve Raporlayıcı Uygulama #
## Projenin Amacı ## 
Belirli zaman aralığında (örn: 5dk da bir) hava durumu API’sinden veri çekip bu verileri 
PostgreSQL ‘e kaydeden ve kullanıcı arayüzünde React ile görselleştirmek.CI/CD  Github 
Actions ve ArgoCD kullanarak uygulamayı otomatik olarak Google Kubernetes Engine (GKE) 
ye deploy etmek.
## Kullanılan Teknolojiler ## 
Backend: Node.js (Express) + PostgreSQL’e veri yazar. 
Frontend: React, geçmiş hava verilerini gösterir. 
VeriTabanı:PostgreSQL 
CI/CD: Github Actions + ArgoCD ile GKE’ye otomatik deploy 
Yönetim: Docker -> Kubernetes -> ArgoCD
