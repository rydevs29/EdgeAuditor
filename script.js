document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("auditForm");
    const targetUrlInput = document.getElementById("targetUrl");
    const errorMessage = document.getElementById("errorMessage");
    const loader = document.getElementById("loader");
    const loadingText = document.getElementById("loadingText");
    const dashboard = document.getElementById("resultsDashboard");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        let urlValue = targetUrlInput.value.trim();
        
        // Auto add https if missing
        if (!/^https?:\/\//i.test(urlValue)) {
            urlValue = 'https://' + urlValue;
            targetUrlInput.value = urlValue;
        }

        try {
            const urlObj = new URL(urlValue);
            const hostname = urlObj.hostname;
            
            // Reset UI
            errorMessage.classList.add("hidden");
            dashboard.classList.add("hidden");
            loader.classList.remove("hidden");
            
            // 1. Fetch Real DNS Data (Menggunakan Google DNS over HTTPS API)
            loadingText.textContent = "Resolving DNS records...";
            const dnsResponse = await fetch(`https://dns.google/resolve?name=${hostname}`);
            const dnsData = await dnsResponse.json();
            
            let resolvedIp = "N/A";
            if (dnsData.Answer && dnsData.Answer.length > 0) {
                // Cari record A (tipe 1 = IPv4)
                const aRecord = dnsData.Answer.find(record => record.type === 1);
                if (aRecord) resolvedIp = aRecord.data;
            }

            // 2. Simulasi Proses Analisis Header (Karena batas CORS di sisi Client)
            // Di lingkungan produksi, ganti setTimeout ini dengan request ke backend RifqyDev
            loadingText.textContent = "Analyzing HTTP security headers...";
            
            setTimeout(() => {
                populateDashboard(urlObj, resolvedIp);
                loader.classList.add("hidden");
                dashboard.classList.remove("hidden");
            }, 1800); // Simulasi delay jaringan

        } catch (error) {
            loader.classList.add("hidden");
            errorMessage.textContent = "Invalid URL format. Please enter a valid website address.";
            errorMessage.classList.remove("hidden");
        }
    });

    function populateDashboard(urlObj, ipAddress) {
        // --- OVERVIEW CARD ---
        document.getElementById("resUrl").textContent = urlObj.href;
        document.getElementById("resIp").textContent = ipAddress;
        
        const protocolEl = document.getElementById("resProtocol");
        if (urlObj.protocol === "https:") {
            protocolEl.textContent = "HTTPS (Secure)";
            protocolEl.className = "badge badge-success";
        } else {
            protocolEl.textContent = "HTTP (Insecure)";
            protocolEl.className = "badge badge-danger";
        }

        // Mocking Response Time (Ping)
        const pingMock = Math.floor(Math.random() * (300 - 45 + 1) + 45); 
        document.getElementById("resTime").textContent = `${pingMock} ms`;

        // --- SECURITY HEADERS CARD (Simulasi Algoritma Audit) ---
        const securityHeaders = [
            { name: "Strict-Transport-Security", status: "good", val: "max-age=31536000" },
            { name: "X-Frame-Options", status: "good", val: "DENY" },
            { name: "X-Content-Type-Options", status: "good", val: "nosniff" },
            { name: "Content-Security-Policy", status: "bad", val: "Missing" },
            { name: "Permissions-Policy", status: "bad", val: "Missing" }
        ];

        const secList = document.getElementById("securityHeadersList");
        secList.innerHTML = ""; // Clear existing
        
        securityHeaders.forEach(header => {
            let iconClass = header.status === "good" ? "ph-check-circle" : "ph-warning-circle";
            let colorClass = header.status === "good" ? "good" : "bad";
            
            secList.innerHTML += `
                <li>
                    <div class="header-name">
                        <i class="ph ${iconClass} status-icon ${colorClass}"></i>
                        ${header.name}
                    </div>
                    <span class="mono-text" style="color: var(--text-muted); font-size: 0.8rem;">${header.val}</span>
                </li>
            `;
        });

        // --- SERVER INFO CARD (Mocking/Estimasi Teknologi) ---
        const serverInfo = [
            { name: "Server", icon: "ph-hard-drive", val: "cloudflare" },
            { name: "X-Powered-By", icon: "ph-code", val: "Hidden (Secure)" },
            { name: "Cache-Control", icon: "ph-clock-counter-clockwise", val: "public, max-age=3600" }
        ];

        const srvList = document.getElementById("serverInfoList");
        srvList.innerHTML = "";
        
        serverInfo.forEach(info => {
            srvList.innerHTML += `
                <li>
                    <div class="header-name">
                        <i class="ph ${info.icon} status-icon neutral"></i>
                        ${info.name}
                    </div>
                    <span class="mono-text" style="color: var(--text-muted); font-size: 0.8rem;">${info.val}</span>
                </li>
            `;
        });
    }
});
