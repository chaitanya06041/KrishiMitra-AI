data = ['Tomato___Bacterial_spot', 'Apple___Apple_scab', 'Squash___Powdery_mildew', 'Peach___healthy', 'Tomato___healthy', 'Blueberry___healthy', 'Tomato___Target_Spot', 'Orange___Haunglongbing_(Citrus_greening)', 'Apple___Black_rot', 'Corn_(maize)___Common_rust_', 'Tomato___Septoria_leaf_spot', 'Apple___healthy', 'Tomato___Tomato_mosaic_virus', 'Potato___Early_blight', 'Tomato___Spider_mites Two-spotted_spider_mite', 'Cherry_(including_sour)___Powdery_mildew', 'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot', 'Tomato___Late_blight', 'Corn_(maize)___Northern_Leaf_Blight', 'Grape___healthy', 'Potato___healthy', 'Raspberry___healthy', 'Apple___Cedar_apple_rust', 'Tomato___Tomato_Yellow_Leaf_Curl_Virus', 'Strawberry___healthy', 'Grape___Black_rot', 'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)', 'Pepper,_bell___healthy', 'Strawberry___Leaf_scorch', 'Grape___Esca_(Black_Measles)', 'Cherry_(including_sour)___healthy', 'Tomato___Leaf_Mold', 'Pepper,_bell___Bacterial_spot', 'Peach___Bacterial_spot', 'Potato___Late_blight', 'Soybean___healthy', 'Corn_(maize)___healthy', 'Tomato___Early_blight']

def parse_class_name(class_name):
    """
    Parses a class name string into its crop and disease components.
    
    Args:
        class_name (str): The string from the dataset, e.g., 'Tomato___Bacterial_spot'.
        
    Returns:
        tuple: A tuple containing the crop name and the disease name.
    """
    # Split the string at '___' to separate the crop and disease
    parts = class_name.split('___')
    
    # The first part is the crop. Replace special characters for readability.
    # Specifically handles cases like 'Pepper,_bell' -> 'Pepper Bell'
    crop = parts[0].replace(',_', ' ').replace('_', ' ')
    
    # The second part is the disease. Replace underscores with spaces.
    # The strip() function removes any leading/trailing spaces that might result
    # from a trailing underscore in the original string (e.g., 'Common_rust_').
    disease = parts[1].replace('_', ' ').strip()
    
    return crop, disease

for row in data: 
    print(f"Row: {row}, Crop: {parse_class_name(row)[0]}, Disease: {parse_class_name(row)[1]}")