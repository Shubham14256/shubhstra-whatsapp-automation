/**
 * Knowledge Base Service
 * Handles doctor-specific medical advice and administrative FAQs
 * Reduces AI API calls by using pre-defined answers
 */

import supabase from '../config/supabaseClient.js';

/**
 * Search knowledge base for matching medical advice
 * @param {string} patientMessage - Patient's message
 * @param {string} doctorId - Doctor's UUID
 * @returns {Promise<Object|null>} - Matching knowledge base entry or null
 */
export const searchMedicalAdvice = async (patientMessage, doctorId) => {
  try {
    if (!patientMessage || !doctorId) {
      return null;
    }

    const lowerMessage = patientMessage.toLowerCase().trim();
    console.log(`🔍 Searching knowledge base for: "${lowerMessage.substring(0, 50)}..."`);

    // Get all active medical knowledge base entries for this doctor
    const { data: entries, error } = await supabase
      .from('doctor_knowledge_base')
      .select('*')
      .eq('doctor_id', doctorId)
      .eq('category', 'medical')
      .eq('is_active', true)
      .order('priority', { ascending: false }); // Higher priority first

    if (error) {
      console.error('❌ Error querying knowledge base:', error);
      return null;
    }

    if (!entries || entries.length === 0) {
      console.log('ℹ️  No knowledge base entries found for this doctor');
      return null;
    }

    console.log(`📚 Found ${entries.length} knowledge base entries`);

    // Check each entry for keyword matches
    for (const entry of entries) {
      if (!entry.keywords || entry.keywords.length === 0) {
        continue;
      }

      // Check if any keyword matches the patient's message
      const matchedKeyword = entry.keywords.find(keyword => 
        lowerMessage.includes(keyword.toLowerCase())
      );

      if (matchedKeyword) {
        console.log(`✅ Match found! Symptom: ${entry.symptom_name}, Keyword: "${matchedKeyword}"`);
        return {
          id: entry.id,
          symptom_name: entry.symptom_name,
          medical_advice: entry.medical_advice,
          matched_keyword: matchedKeyword,
          source: 'knowledge_base'
        };
      }
    }

    console.log('ℹ️  No matching keywords found in knowledge base');
    return null;

  } catch (error) {
    console.error('❌ Exception in searchMedicalAdvice:', error);
    return null;
  }
};

/**
 * Search knowledge base for administrative FAQs
 * @param {string} patientMessage - Patient's message
 * @param {string} doctorId - Doctor's UUID
 * @returns {Promise<Object|null>} - Matching FAQ or null
 */
export const searchAdministrativeFAQ = async (patientMessage, doctorId) => {
  try {
    if (!patientMessage || !doctorId) {
      return null;
    }

    const lowerMessage = patientMessage.toLowerCase().trim();

    // Get all active administrative entries for this doctor
    const { data: entries, error } = await supabase
      .from('doctor_knowledge_base')
      .select('*')
      .eq('doctor_id', doctorId)
      .eq('category', 'administrative')
      .eq('is_active', true)
      .order('priority', { ascending: false });

    if (error) {
      console.error('❌ Error querying administrative FAQs:', error);
      return null;
    }

    if (!entries || entries.length === 0) {
      return null;
    }

    // Simple keyword matching for FAQs
    for (const entry of entries) {
      const questionLower = entry.question?.toLowerCase() || '';
      
      // Check if message contains significant words from the question
      const questionWords = questionLower.split(' ').filter(word => word.length > 3);
      const matchCount = questionWords.filter(word => lowerMessage.includes(word)).length;
      
      // If more than 50% of question words match, consider it a match
      if (matchCount > questionWords.length * 0.5) {
        console.log(`✅ FAQ Match found: "${entry.question}"`);
        return {
          id: entry.id,
          question: entry.question,
          answer: entry.answer,
          source: 'knowledge_base_faq'
        };
      }
    }

    return null;

  } catch (error) {
    console.error('❌ Exception in searchAdministrativeFAQ:', error);
    return null;
  }
};

/**
 * Get all knowledge base entries for a doctor
 * @param {string} doctorId - Doctor's UUID
 * @param {string} category - Optional category filter ('medical' or 'administrative')
 * @returns {Promise<Array>} - Array of knowledge base entries
 */
export const getKnowledgeBaseEntries = async (doctorId, category = null) => {
  try {
    let query = supabase
      .from('doctor_knowledge_base')
      .select('*')
      .eq('doctor_id', doctorId)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ Error fetching knowledge base entries:', error);
      return [];
    }

    return data || [];

  } catch (error) {
    console.error('❌ Exception in getKnowledgeBaseEntries:', error);
    return [];
  }
};

/**
 * Create a new knowledge base entry
 * @param {Object} entry - Knowledge base entry data
 * @returns {Promise<Object|null>} - Created entry or null
 */
export const createKnowledgeBaseEntry = async (entry) => {
  try {
    const { data, error } = await supabase
      .from('doctor_knowledge_base')
      .insert(entry)
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating knowledge base entry:', error);
      return null;
    }

    console.log(`✅ Knowledge base entry created (ID: ${data.id})`);
    return data;

  } catch (error) {
    console.error('❌ Exception in createKnowledgeBaseEntry:', error);
    return null;
  }
};

/**
 * Update a knowledge base entry
 * @param {string} entryId - Entry UUID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object|null>} - Updated entry or null
 */
export const updateKnowledgeBaseEntry = async (entryId, updates) => {
  try {
    const { data, error } = await supabase
      .from('doctor_knowledge_base')
      .update(updates)
      .eq('id', entryId)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating knowledge base entry:', error);
      return null;
    }

    console.log(`✅ Knowledge base entry updated (ID: ${entryId})`);
    return data;

  } catch (error) {
    console.error('❌ Exception in updateKnowledgeBaseEntry:', error);
    return null;
  }
};

/**
 * Delete a knowledge base entry
 * @param {string} entryId - Entry UUID
 * @returns {Promise<boolean>} - Success status
 */
export const deleteKnowledgeBaseEntry = async (entryId) => {
  try {
    const { error } = await supabase
      .from('doctor_knowledge_base')
      .delete()
      .eq('id', entryId);

    if (error) {
      console.error('❌ Error deleting knowledge base entry:', error);
      return false;
    }

    console.log(`✅ Knowledge base entry deleted (ID: ${entryId})`);
    return true;

  } catch (error) {
    console.error('❌ Exception in deleteKnowledgeBaseEntry:', error);
    return false;
  }
};

/**
 * Get statistics about knowledge base usage
 * @param {string} doctorId - Doctor's UUID
 * @returns {Promise<Object>} - Statistics object
 */
export const getKnowledgeBaseStats = async (doctorId) => {
  try {
    const { data, error } = await supabase
      .from('doctor_knowledge_base')
      .select('category, is_active')
      .eq('doctor_id', doctorId);

    if (error) {
      console.error('❌ Error fetching knowledge base stats:', error);
      return { total: 0, medical: 0, administrative: 0, active: 0 };
    }

    const stats = {
      total: data.length,
      medical: data.filter(e => e.category === 'medical').length,
      administrative: data.filter(e => e.category === 'administrative').length,
      active: data.filter(e => e.is_active).length,
      inactive: data.filter(e => !e.is_active).length
    };

    return stats;

  } catch (error) {
    console.error('❌ Exception in getKnowledgeBaseStats:', error);
    return { total: 0, medical: 0, administrative: 0, active: 0 };
  }
};

export default {
  searchMedicalAdvice,
  searchAdministrativeFAQ,
  getKnowledgeBaseEntries,
  createKnowledgeBaseEntry,
  updateKnowledgeBaseEntry,
  deleteKnowledgeBaseEntry,
  getKnowledgeBaseStats
};
