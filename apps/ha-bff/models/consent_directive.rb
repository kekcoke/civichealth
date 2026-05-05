# frozen_string_literal: true

class ConsentDirective < ActiveRecord::Base
  self.primary_key = "id"

  belongs_to :patient

  validates :patient_id, :directive_type, :effective_date, presence: true
  validates :directive_type, inclusion: { in: %w[EMR_SHARE RESEARCH MARKETING] }
end
