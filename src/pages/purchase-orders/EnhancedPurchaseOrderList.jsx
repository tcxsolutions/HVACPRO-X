import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../components/common/SafeIcon'
import Modal from '../../components/common/Modal'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'  // Changed to named import
import toast from 'react-hot-toast'

// Rest of the file remains the same...