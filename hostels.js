
    // Your Supabase credentials
    const SUPABASE_URL = "https://gedypyckfdolzraldrvw.supabase.co";
    const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlZHlweWNrZmRvbHpyYWxkcnZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyNjI2MzEsImV4cCI6MjA3MzgzODYzMX0.hof3ZndZMdFuc6FoV1zECEu_IkyU29pzMVp0jfNGLuM";
    
    const { createClient } = supabase;
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Sample data to preload if database is empty
    const sampleHostels = [
        {name: "Sunny Hostel", price: 4500, food_quality: 4, location: "https://goo.gl/maps/xyz1", reviews: "Great place for students! Very clean and the staff is friendly. Wi-Fi is excellent and the location is perfect for college commute.", img: "https://images.unsplash.com/photo-1560347876-aeef00ee58a1?w=400&h=300&fit=crop"},
        {name: "City PG", price: 6000, food_quality: 5, location: "https://goo.gl/maps/xyz2", reviews: "Very clean and cozy. Excellent food quality and good Wi-Fi. The owner is very caring and maintains high hygiene standards.", img: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&h=300&fit=crop"},
        {name: "Green Hostel", price: 3500, food_quality: 3, location: "https://goo.gl/maps/xyz3", reviews: "Affordable but food can improve. Good for budget-conscious students. Clean rooms and decent facilities for the price.", img: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop"},
        {name: "Blue PG", price: 5000, food_quality: 4, location: "https://goo.gl/maps/xyz4", reviews: "Friendly staff, safe location. Near to metro station. Good security arrangements and 24/7 water supply.", img: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400&h=300&fit=crop"},
        {name: "Happy Stay Hostel", price: 4000, food_quality: 4, location: "https://goo.gl/maps/xyz5", reviews: "Good ambiance and vibes. Perfect for working professionals. Common area is well-maintained and has all amenities.", img: "https://images.unsplash.com/photo-1598300057501-4a4b52b1325c?w=400&h=300&fit=crop"},
        {name: "Modern PG", price: 7000, food_quality: 5, location: "https://goo.gl/maps/xyz6", reviews: "Premium facilities, worth it. AC rooms, gym facility, and excellent food. Perfect for professionals who want comfort.", img: "https://images.unsplash.com/photo-1576671086155-7c91c285ef68?w=400&h=300&fit=crop"},
        {name: "Budget Hostel", price: 3000, food_quality: 3, location: "https://goo.gl/maps/xyz7", reviews: "Cheap and clean. Basic amenities but well-maintained. Good for students on tight budget.", img: "https://images.unsplash.com/photo-1520880867055-1e30d1cb001c?w=400&h=300&fit=crop"},
        {name: "Comfort PG", price: 5500, food_quality: 4, location: "https://goo.gl/maps/xyz8", reviews: "Comfortable and safe. Great location with easy access to public transport. Food is homely and delicious.", img: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400&h=300&fit=crop"}
    ];

    let searchTimeout;

    // Debounce search to avoid too many API calls
    function debounceSearch() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
        fetchHostels();
        }, 500);
    }

    // Preload sample data if database is empty
    async function preloadSampleData() {
        try {
        const { data, error } = await supabaseClient.from("hostels").select("*").limit(1);
        if (error) {
            console.error("Error checking for existing data:", error);
            return;
        }
        
        if (data.length === 0) {
            console.log("Database is empty, adding sample data...");
            const { error: insertError } = await supabaseClient.from("hostels").insert(sampleHostels);
            if (insertError) {
            console.error("Error inserting sample data:", insertError);
            } else {
            console.log("Sample data added successfully!");
            }
        }
        } catch (err) {
        console.error("Error in preloadSampleData:", err);
        }
    }

    function previewImageFile() {
    const fileInput = document.getElementById("imgFile");
    const preview = document.getElementById("imagePreview");

    if (fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.src = e.target.result;
            preview.style.display = "block";
        };
        reader.readAsDataURL(fileInput.files[0]);
    } else {
        preview.style.display = "none";
    }
}


    function isValidImageUrl(url) {
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
        const lowerUrl = url.toLowerCase();
        return imageExtensions.some(ext => lowerUrl.includes(ext)) || 
            lowerUrl.includes('unsplash.com') || 
            lowerUrl.includes('images.') ||
            lowerUrl.includes('imgur.com') ||
            lowerUrl.includes('cloudinary.com');
    }

    async function fetchHostels() {
    try {
        const searchName = document.getElementById("searchName").value.trim();
        const maxPrice = document.getElementById("maxPrice").value;
        const minRating = document.getElementById("minRating").value;
        const sortBy = document.getElementById("sortBy").value;

        let query = supabaseClient.from("hostels").select("*");

        // Filter by max price
        if (maxPrice) {
        query = query.lte("price", parseInt(maxPrice));
        }

        // Filter by min rating
        if (minRating) {
        query = query.gte("food_quality", parseInt(minRating));
        }

        // Search in name OR reviews
        if (searchName) {
        // Wrap the search string in %% for partial match
        const searchPattern = `%${searchName}%`;
        query = query.or(`name.ilike.${searchPattern},reviews.ilike.${searchPattern}`);
        }

        // Sorting
        switch (sortBy) {
        case "price_asc":
            query = query.order("price", { ascending: true });
            break;
        case "price_desc":
            query = query.order("price", { ascending: false });
            break;
        case "rating_desc":
            query = query.order("food_quality", { ascending: false });
            break;
        case "name":
            query = query.order("name", { ascending: true });
            break;
        default:
            query = query.order("created_at", { ascending: false });
        }

        const { data, error } = await query;

        if (error) {
        console.error("Error fetching hostels:", error);
        document.getElementById("hostelsList").innerHTML = `
            <div class="no-results">
            <div style="font-size: 2rem;">⚠️</div>
            <div>Error loading hostels. Try again later.</div>
            </div>
        `;
        return;
        }

        renderHostels(data || []);
        updateStats(data || []);
    } catch (err) {
        console.error("Error in fetchHostels:", err);
        document.getElementById("hostelsList").innerHTML = `
        <div class="no-results">
            <div style="font-size: 2rem;">⚠️</div>
            <div>Error fetching hostels. Please check your connection.</div>
        </div>
        `;
    }
    }



    async function addHostel() {
    try {
        // Get form values
        const name = document.getElementById("name").value.trim();
        const price = document.getElementById("price").value;
        const food_quality = document.getElementById("food").value;
        const location = document.getElementById("location").value.trim();
        const reviews = document.getElementById("reviews").value.trim();
        const fileInput = document.getElementById("imgFile");
        const file = fileInput.files[0];

        // Validations
        if (!name || !price || !food_quality || !location) { 
            alert("Please fill all required fields (marked with *)!"); 
            return; 
        }

        if (parseInt(price) < 1000 || parseInt(price) > 50000) {
            alert("Please enter a realistic price between ₹1,000 and ₹50,000!");
            return;
        }

        if (!location.includes('maps.google') && !location.includes('goo.gl') && !location.includes('maps.app.goo.gl')) {
            alert("Please enter a valid Google Maps link!");
            return;
        }

        let imageUrl = "https://images.unsplash.com/photo-1560347876-aeef00ee58a1?w=400&h=300&fit=crop"; // default image

        // Upload file if selected
        if (file) {
            const fileName = `${Date.now()}_${file.name}`;
            const { data: uploadData, error: uploadError } = await supabaseClient
                .storage
                .from("hostel-images")      // replace with your bucket name
                .upload(fileName, file);

            if (uploadError) {
                console.error("Image upload error:", uploadError);
                alert("Error uploading image. Using default image.");
            } else {
                // Get public URL
                const { publicUrl, error: urlError } = supabaseClient
                    .storage
                    .from("hostel-images")
                    .getPublicUrl(fileName);

                if (!urlError) imageUrl = publicUrl;
            }
        }

        // Prepare new hostel data
        const newHostel = {
            name,
            price: parseInt(price),
            food_quality: parseInt(food_quality),
            location,
            reviews: reviews || "No reviews yet",
            img: imageUrl
        };

        // Insert into Supabase DB
        const { data, error } = await supabaseClient.from("hostels").insert([newHostel]).select();
        if (error) {
            console.error("Error adding hostel:", error);
            alert("Error adding hostel. Please try again.");
            return;
        }

        // Clear form
        document.getElementById("name").value = "";
        document.getElementById("price").value = "";
        document.getElementById("food").value = "";
        document.getElementById("location").value = "";
        document.getElementById("reviews").value = "";
        document.getElementById("imgFile").value = "";
        document.getElementById("imagePreview").style.display = "none";

        // Reset search filters
        document.getElementById("searchName").value = "";
        document.getElementById("maxPrice").value = "";
        document.getElementById("minRating").value = "";
        document.getElementById("sortBy").value = "created_at";

        // Show success message
        const successMsg = document.createElement("div");
        successMsg.innerHTML = "🎉 Hostel/PG added successfully!";
        successMsg.style.cssText = `
            position: fixed; top: 20px; right: 20px; z-index: 1000;
            background: linear-gradient(135deg, #28a745, #20c997);
            color: white; padding: 15px 25px; border-radius: 10px;
            font-weight: bold; box-shadow: 0 8px 25px rgba(0,0,0,0.2);
            animation: slideIn 0.5s ease;
        `;
        document.body.appendChild(successMsg);
        setTimeout(() => successMsg.remove(), 3000);

        // Refresh hostel list
        setTimeout(() => fetchHostels(), 200);

    } catch (err) {
        console.error("Error in addHostel:", err);
        alert("Error adding hostel. Please try again.");
    }
}




    async function updateHostelRating(id, rating) {
        try {
        const { error } = await supabaseClient
            .from("hostels")
            .update({ food_quality: rating })
            .eq("id", id);

        if (error) {
            console.error("Error updating rating:", error);
            alert("Error updating rating. Please try again.");
            return;
        }

        fetchHostels();
        
        // Show quick feedback
        const feedback = document.createElement("div");
        feedback.innerHTML = "⭐ Rating updated!";
        feedback.style.cssText = `
            position: fixed; top: 20px; right: 20px; z-index: 1000;
            background: #ffc107; color: #333; padding: 10px 20px; 
            border-radius: 8px; font-weight: bold;
        `;
        document.body.appendChild(feedback);
        setTimeout(() => feedback.remove(), 2000);
        } catch (err) {
        console.error("Error in updateHostelRating:", err);
        alert("Error updating rating. Please try again.");
        }
    }

    async function updateHostelReview(id, review) {
        try {
        if (!review.trim()) {
            alert("Please enter a review!");
            return;
        }
        
        const { error } = await supabaseClient
            .from("hostels")
            .update({ reviews: review.trim() })
            .eq("id", id);

        if (error) {
            console.error("Error updating review:", error);
            alert("Error updating review. Please try again.");
            return;
        }

        // Clear the textarea
        document.getElementById(`newReview-${id}`).value = "";

        fetchHostels();
        
        // Show success feedback
        const feedback = document.createElement("div");
        feedback.innerHTML = "📝 Review updated successfully!";
        feedback.style.cssText = `
            position: fixed; top: 20px; right: 20px; z-index: 1000;
            background: linear-gradient(135deg, #28a745, #20c997);
            color: white; padding: 10px 20px; border-radius: 8px;
            font-weight: bold; box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        `;
        document.body.appendChild(feedback);
        setTimeout(() => feedback.remove(), 2500);
        } catch (err) {
        console.error("Error in updateHostelReview:", err);
        alert("Error updating review. Please try again.");
        }
    }

    function updateStats(hostels) {
        const totalHostels = hostels.length;
        const avgPrice = totalHostels > 0 ? Math.round(hostels.reduce((sum, h) => sum + h.price, 0) / totalHostels) : 0;
        const avgRating = totalHostels > 0 ? (hostels.reduce((sum, h) => sum + h.food_quality, 0) / totalHostels).toFixed(1) : 0;
        const topRated = hostels.filter(h => h.food_quality === 5).length;

        document.getElementById("totalHostels").textContent = totalHostels;
        document.getElementById("avgPrice").textContent = `₹${avgPrice.toLocaleString()}`;
        document.getElementById("avgRating").textContent = avgRating;
        document.getElementById("topRated").textContent = topRated;
    }

    function renderHostels(hostelsToRender) {
        const listDiv = document.getElementById("hostelsList");
        
        if (hostelsToRender.length === 0) {
        listDiv.innerHTML = `
            <div class="no-results">
            <div>No hostels found matching your criteria</div>
            <div style="margin-top: 15px; font-size: 1rem; color: #999;">
                Try adjusting your search filters or add a new listing!
            </div>
            </div>
        `;
        return;
        }
        
        listDiv.innerHTML = "";
        
        hostelsToRender.forEach(h => {
        const div = document.createElement("div");
        div.className = "card";

        let starsHTML = "";
        for (let i = 1; i <= 5; i++) {
            starsHTML += `<span onclick="updateHostelRating(${h.id},${i})" title="Rate ${i} star${i>1?'s':''}" 
                        style="color: ${i <= h.food_quality ? '#ffc107' : '#ddd'}">${i <= h.food_quality ? '⭐' : '☆'}</span>`;
        }

        const defaultImg = "https://images.unsplash.com/photo-1560347876-aeef00ee58a1?w=400&h=300&fit=crop";
        const imgSrc = h.img || defaultImg;

        div.innerHTML = `
            <div class="card-image-container">
            <img src="${imgSrc}" alt="${h.name}" onerror="this.src='${defaultImg}'">
            </div>
            <div class="card-content">
            <h3>${h.name}</h3>
            <div class="price-tag">₹${h.price.toLocaleString()}/month</div>
            
            <div class="rating-section">
                <span class="rating-label">Food Quality Rating:</span>
                <div class="stars">${starsHTML}</div>
            </div>
            
            <div class="reviews-section">
                <span class="rating-label">Reviews:</span>
                <div class="reviews-text">${h.reviews || "No reviews yet"}</div>
                <textarea id="newReview-${h.id}" placeholder="Share your experience about this place... (cleanliness, food, staff, facilities, etc.)"></textarea>
                <button onclick="updateHostelReview(${h.id}, document.getElementById('newReview-${h.id}').value)" class="card-button">
                📝 Update Review
                </button>
            </div>
            
            <a href="${h.location}" target="_blank" rel="noopener noreferrer" class="map-link">
                📍 View Location on Google Maps
            </a>
            </div>
        `;
        listDiv.appendChild(div);
        });
    }

    // Add CSS animation keyframes
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
        }
        
        @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
        }
        
        .card:hover .price-tag {
        animation: pulse 0.6s ease-in-out;
        }
    `;
    document.head.appendChild(style);

    // Enhanced error handling for network issues
    window.addEventListener('offline', () => {
        const offlineMsg = document.createElement("div");
        offlineMsg.innerHTML = "🔌 You're offline. Some features may not work.";
        offlineMsg.style.cssText = `
        position: fixed; bottom: 20px; left: 20px; right: 20px; z-index: 1000;
        background: #dc3545; color: white; padding: 15px; border-radius: 10px;
        text-align: center; font-weight: bold;
        `;
        document.body.appendChild(offlineMsg);
        setTimeout(() => offlineMsg.remove(), 5000);
    });

    window.addEventListener('online', () => {
        const onlineMsg = document.createElement("div");
        onlineMsg.innerHTML = "🌐 Back online! Refreshing data...";
        onlineMsg.style.cssText = `
        position: fixed; bottom: 20px; left: 20px; right: 20px; z-index: 1000;
        background: #28a745; color: white; padding: 15px; border-radius: 10px;
        text-align: center; font-weight: bold;
        `;
        document.body.appendChild(onlineMsg);
        setTimeout(() => {
        onlineMsg.remove();
        fetchHostels();
        }, 2000);
    });

    // Initialize app when DOM is loaded
    document.addEventListener('DOMContentLoaded', async () => {
        try {
        await preloadSampleData();
        await fetchHostels();
        } catch (error) {
        console.error("Error initializing app:", error);
        document.getElementById("hostelsList").innerHTML = `
            <div class="no-results">
            <div style="font-size: 3rem; margin-bottom: 20px;">⚠️</div>
            <div>Failed to load application. Please refresh the page.</div>
            <div style="margin-top: 15px;">
                <button onclick="window.location.reload()" 
                        style="background: #007bff; color: white; border: none; 
                            padding: 10px 20px; border-radius: 5px; cursor: pointer;">
                🔄 Refresh Page
                </button>
            </div>
            </div>
        `;
        }
    });

    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + Enter to add hostel when in form
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        const focusedElement = document.activeElement;
        if (focusedElement && (
            focusedElement.id === 'name' || 
            focusedElement.id === 'price' || 
            focusedElement.id === 'food' || 
            focusedElement.id === 'location' || 
            focusedElement.id === 'reviews' || 
            focusedElement.id === 'img'
            )) {
            e.preventDefault();
            addHostel();
        }
        }
        
        // Escape to clear search
        if (e.key === 'Escape') {
        document.getElementById('searchName').value = '';
        document.getElementById('maxPrice').value = '';
        document.getElementById('minRating').value = '';
        fetchHostels();
        }
    });

    // Add scroll-to-top functionality
    window.addEventListener('scroll', () => {
        const scrollButton = document.getElementById('scrollToTop');
        if (window.pageYOffset > 300) {
        if (!scrollButton) {
            const btn = document.createElement('button');
            btn.id = 'scrollToTop';
            btn.innerHTML = '↑';
            btn.style.cssText = `
            position: fixed; bottom: 20px; right: 20px; z-index: 1000;
            width: 50px; height: 50px; border-radius: 50%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white; border: none; font-size: 20px; font-weight: bold;
            cursor: pointer; box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            transition: all 0.3s ease;
            `;
            btn.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
            btn.onmouseover = () => btn.style.transform = 'scale(1.1)';
            btn.onmouseout = () => btn.style.transform = 'scale(1)';
            document.body.appendChild(btn);
        }
        } else if (scrollButton) {
        scrollButton.remove();
        }
    });
