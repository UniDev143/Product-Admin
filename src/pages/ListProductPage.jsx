import React, { useState } from 'react'

const CATEGORIES = [
  'Single disk floor scrubbing machine',
  'janitorial equipments',
  'floor cleaning chemicals and equipments',
  'ride on scrubber dryer',
  'industrial vacumm cleaner',
  'walk behind scubber dryer',
]

const initialState = {
  name: '',
  manufacturedIn: '',
  companyName: '',
  description: '',
  category: CATEGORIES[0],
}

const ListProductPage = ({ onAddProduct, notice }) => {
  const [formData, setFormData] = useState(initialState)
  const [mainImageFile, setMainImageFile] = useState(null)
  const [otherImageFiles, setOtherImageFiles] = useState([])

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!mainImageFile) {
      return
    }

    const payload = new FormData()
    payload.append('name', formData.name.trim())
    payload.append('manufacturedIn', formData.manufacturedIn.trim())
    payload.append('companyName', formData.companyName.trim())
    payload.append('description', formData.description.trim())
    payload.append('category', formData.category)
    payload.append('mainImage', mainImageFile)

    otherImageFiles.forEach((file) => {
      payload.append('otherImages', file)
    })

    const isSuccess = await onAddProduct(payload)

    if (isSuccess) {
      setFormData(initialState)
      setMainImageFile(null)
      setOtherImageFiles([])
      event.target.reset()
    }
  }

  return (
    <section className="panel">
      <h2 className="panel-title">List Product</h2>

      {notice && <p className="notice-note">{notice}</p>}

      <form className="form-grid" onSubmit={handleSubmit}>
        <label>
          Name
          <input name="name" value={formData.name} onChange={handleChange} required />
        </label>

        <label>
          Manufactured In
          <input name="manufacturedIn" value={formData.manufacturedIn} onChange={handleChange} required />
        </label>

        <label>
          Company Name
          <input name="companyName" value={formData.companyName} onChange={handleChange} required />
        </label>

        <label>
          Description
          <textarea name="description" value={formData.description} onChange={handleChange} rows={4} required />
        </label>

        <label>
          Main Image
          <input
            type="file"
            accept="image/*"
            onChange={(event) => setMainImageFile(event.target.files?.[0] || null)}
            required
          />
        </label>

        <label>
          Other Images (optional)
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(event) => setOtherImageFiles(Array.from(event.target.files || []))}
          />
        </label>

        <label>
          Category
          <select name="category" value={formData.category} onChange={handleChange}>
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        <button type="submit" className="btn btn-primary">Add Product</button>
      </form>
    </section>
  )
}

export default ListProductPage