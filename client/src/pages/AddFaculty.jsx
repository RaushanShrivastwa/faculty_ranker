// AddFaculty.jsx
import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const clamp = (value) => {
  const num = parseFloat(value)
  if (isNaN(num)) return ''
  return Math.min(Math.max(num, 0), 5).toString()
}

// ——— Direct upload helper ———
async function uploadToCloudinary(file) {
  const url = `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/upload`
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET)

  const res = await fetch(url, {
    method: 'POST',
    body: formData
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error?.message || 'Cloudinary upload failed')
  return { imageUrl: data.secure_url, imagePublicId: data.public_id }
}

export default function AddFaculty() {
  const [formData, setFormData] = useState({
    name: '',
    rating: '',
    image: null,
    correction_rating: '',
    attendance_rating: ''
  })
  const [error, setError] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()

  useEffect(() => {
    if (!isAuthenticated) navigate('/login')
  }, [isAuthenticated, navigate])

  const handleChange = (e) => {
    const { name, value, files } = e.target
    let newValue = value
    if (['rating', 'correction_rating', 'attendance_rating'].includes(name)) {
      newValue = clamp(value)
    }
    setFormData(prev => ({ ...prev, [name]: files ? files[0] : newValue }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      let imageUrl = ''
      let imagePublicId = ''

      // 1️⃣ Direct Cloudinary upload
      if (formData.image instanceof File) {
        setIsUploading(true)
        const uploadResult = await uploadToCloudinary(formData.image)
        imageUrl = uploadResult.imageUrl
        imagePublicId = uploadResult.imagePublicId
        setIsUploading(false)
      }

      // 2️⃣ Send faculty data to your API
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/faculty`,
        {
          name: formData.name,
          rating: parseFloat(formData.rating),
          correction_rating: parseFloat(formData.correction_rating),
          attendance_rating: parseFloat(formData.attendance_rating),
          image: imageUrl,
          imagePublicId
        },
        {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        }
      )

      navigate('/')
    } catch (err) {
      console.error('Error adding faculty:', err)
      if (err.message.includes('Cloudinary')) {
        setError('Image upload failed. Try a smaller file or different format.')
      } else if (err.response?.status === 409) {
        setError('Faculty already exists.')
      } else if (err.response?.status === 401) {
        setError('Unauthorized. Please log in again.')
      } else {
        setError(err.response?.data?.message || err.message || 'Something went wrong.')
      }
    } finally {
      setIsUploading(false)
      setIsSubmitting(false)
    }
  }

  const isDisabled = isUploading || isSubmitting

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-12 px-4">
      <div className="max-w-md mx-auto bg-gray-800 rounded-xl shadow-md p-8">
        <h2 className="text-2xl font-bold text-white mb-6">Add New Faculty</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            disabled={isDisabled}
            placeholder="Faculty Name"
            className="w-full px-3 py-2 rounded bg-gray-700 text-white"
            required
          />
          <input
            name="rating"
            type="number"
            step="0.1"
            value={formData.rating}
            onChange={handleChange}
            disabled={isDisabled}
            placeholder="Teaching Rating (0-5)"
            className="w-full px-3 py-2 rounded bg-gray-700 text-white"
            required
          />
          <input
            name="correction_rating"
            type="number"
            step="0.1"
            value={formData.correction_rating}
            onChange={handleChange}
            disabled={isDisabled}
            placeholder="Correction Rating (0-5)"
            className="w-full px-3 py-2 rounded bg-gray-700 text-white"
            required
          />
          <input
            name="attendance_rating"
            type="number"
            step="0.1"
            value={formData.attendance_rating}
            onChange={handleChange}
            disabled={isDisabled}
            placeholder="Attendance Rating (0-5)"
            className="w-full px-3 py-2 rounded bg-gray-700 text-white"
            required
          />
          <input
            name="image"
            type="file"
            accept="image/*"
            onChange={handleChange}
            disabled={isDisabled}
            className="w-full px-3 py-2 rounded bg-gray-700 text-white"
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={isDisabled}
            className={`w-full py-2 px-4 rounded text-white ${
              isDisabled ? 'bg-gray-500' : 'bg-purple-600 hover:bg-purple-700'
            }`}
          >
            {isUploading
              ? 'Uploading Image...'
              : isSubmitting
              ? 'Submitting...'
              : 'Add Faculty'}
          </button>
        </form>
      </div>
    </div>
  )
}
